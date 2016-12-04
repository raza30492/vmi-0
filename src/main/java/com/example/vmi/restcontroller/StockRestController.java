package com.example.vmi.restcontroller;

import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.collections4.map.HashedMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import com.example.vmi.dto.StockMissing;
import com.example.vmi.entity.Buyer;
import com.example.vmi.entity.SKU;
import com.example.vmi.service.BuyerService;
import com.example.vmi.service.StockDetailService;
import com.example.vmi.storage.StockDetailStorageService;
import com.example.vmi.util.MiscUtil;

@RestController
@RequestMapping("/api/stock")
public class StockRestController {

    @Autowired private StockDetailStorageService storageService;
    
    @Autowired private StockDetailService stockDetailService;
    
    @Autowired private BuyerService buyerService;
    
    

    @GetMapping("/{year}")
    public ResponseEntity<?> listUploadedFiles(@RequestParam("buyer") String buyerName,@PathVariable int year) throws IOException {
    	
    	Buyer buyer = buyerService.findOne(buyerName);
    	List<Map<String, String>> list = storageService.loadAll(buyer.getId(), year)
    		.map(
				(path) -> {
					Map<String,String> hashmap = new HashedMap<>();
					hashmap.put("filename", path.getFileName().toString());
	    			String href = MvcUriComponentsBuilder
	    							.fromMethodName(StockRestController.class, "serveFile", path.getFileName().toString(),buyerName, year)
	    							.build().toString();
	    			hashmap.put("href", href);
	    			return hashmap;
				}
    		).collect(Collectors.toList());

        return new ResponseEntity<List<Map<String,String>>>(list, HttpStatus.OK);
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename,@RequestParam("buyer") String buyerName, @RequestParam("year") int year) {
    	Buyer buyer = buyerService.findOne(buyerName);
        Resource file = storageService.loadAsResource(buyer.getId(), year, filename);
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getFilename()+"\"")
                .body(file);
    }
    
    @DeleteMapping("/files/{filename:.+}")
    public ResponseEntity<Void> deleteFile(@PathVariable String filename, @RequestParam("buyer") String buyerName, @RequestParam("year") int year) {
    	Buyer buyer = buyerService.findOne(buyerName);
        storageService.delete(buyer.getId(), year,filename);
        int week = MiscUtil.getWeekFromFilename(filename);
        stockDetailService.delete(year, week);
        return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                
    }
    
    @PostMapping("/")
    public ResponseEntity<?> uploadStock(@RequestParam("buyer") String buyerName, @RequestParam("year") Integer year, @RequestParam("week") Integer week, @RequestParam("file") MultipartFile file ) {
    	Buyer buyer = buyerService.findOne(buyerName);
    	String filename = null;
    	if(file.getOriginalFilename().contains("xlsx")){
    		filename = "Sales_Week" + week + "_Year" + year + ".xlsx";
    	}else if(file.getOriginalFilename().contains("xls")){
    		filename = "Sales_Week" + week + "_Year" + year + ".xls";
    	}else{
    		return new ResponseEntity<StockMissing>(new StockMissing("FILE_NOT_SUPPORTED"), HttpStatus.CONFLICT);
    	}
    	
    	try {
			storageService.store(buyer.getId(), year, file, filename);
		} catch (FileAlreadyExistsException e) {
			return new ResponseEntity<StockMissing>(new StockMissing("FILE_ALREADY_EXIST"), HttpStatus.CONFLICT);
		}
    	
    	List<String> fitsMissing = new ArrayList<>();
    	List<SKU> skusMissing = new ArrayList<>();
    	stockDetailService.addBatch(year, week, storageService.load(buyer.getId(), year, filename).toFile(), fitsMissing, skusMissing);
    	
    	if(fitsMissing.size() > 0){
    		storageService.delete(buyer.getId(), year, filename);
    		
    		StockMissing missing = new StockMissing("FITS_MISSING");
    		missing.setFitsMissing(fitsMissing);
    		return new ResponseEntity<StockMissing>(missing, HttpStatus.CONFLICT);
    	}else if(skusMissing.size() > 0){
    		storageService.delete(buyer.getId(), year, filename);
    		
    		StockMissing missing = new StockMissing("SKUS_MISSING");
    		missing.setSkusMissing(skusMissing);
    		return new ResponseEntity<StockMissing>(missing, HttpStatus.CONFLICT);
    	}
    	return new ResponseEntity<Void>(HttpStatus.OK);
    }
}
