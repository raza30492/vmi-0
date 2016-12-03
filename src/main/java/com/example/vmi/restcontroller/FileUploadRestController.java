package com.example.vmi.restcontroller;

import org.apache.commons.collections4.map.HashedMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import com.example.vmi.dto.StockMissing;
import com.example.vmi.entity.SKU;
import com.example.vmi.service.SkuService;
import com.example.vmi.service.StockDetailService;
import com.example.vmi.storage.StorageFileNotFoundException;
import com.example.vmi.storage.StorageService;

import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/upload")
public class FileUploadRestController {

    @Autowired private StorageService storageService;
    
    @Autowired private SkuService skuService;
    
    @Autowired private StockDetailService stockDetailService;

    @GetMapping("/{year}")
    public ResponseEntity<?> listUploadedFiles(@PathVariable int year) throws IOException {
    	
    	List<Map<String, String>> list = storageService.loadAll(year)
    		.map(
				(path) -> {
					Map<String,String> hashmap = new HashedMap<>();
					hashmap.put("filename", path.getFileName().toString());
	    			String href = MvcUriComponentsBuilder
	    							.fromMethodName(FileUploadRestController.class, "serveFile", path.getFileName().toString(), year)
	    							.build().toString();
	    			hashmap.put("href", href);
	    			return hashmap;
				}
    		).collect(Collectors.toList());

        return new ResponseEntity<List<Map<String,String>>>(list, HttpStatus.OK);
    }

    @GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename, @RequestParam("year") int year) {

        Resource file = storageService.loadAsResource(year,filename);
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getFilename()+"\"")
                .body(file);
    }

    @PostMapping("/sku")
    public ResponseEntity<Void> uploadSku(@RequestParam("fit") String fit, @RequestParam("file") MultipartFile file ) {
    	if(!file.isEmpty()){
    		skuService.addBatch(fit, file);
    	}
    	return new ResponseEntity<Void>(HttpStatus.OK);
    }
    
    @PostMapping("/stock")
    public ResponseEntity<?> uploadStock(@RequestParam("year") Integer year, @RequestParam("week") Integer week, @RequestParam("file") MultipartFile file ) {
    	
    	String filename = null;
    	if(file.getOriginalFilename().contains("xlsx")){
    		filename = "Sales_Week" + week + "_Year" + year + ".xlsx";
    	}else if(file.getOriginalFilename().contains("xls")){
    		filename = "Sales_Week" + week + "_Year" + year + ".xls";
    	}else{
    		return new ResponseEntity<StockMissing>(new StockMissing("FILE_NOT_SUPPORTED"), HttpStatus.CONFLICT);
    	}
    	
    	try {
			storageService.store(year,file, filename);
		} catch (FileAlreadyExistsException e) {
			return new ResponseEntity<StockMissing>(new StockMissing("FILE_ALREADY_EXIST"), HttpStatus.CONFLICT);
		}
    	
    	List<String> fitsMissing = new ArrayList<>();
    	List<SKU> skusMissing = new ArrayList<>();
    	stockDetailService.addBatch(year, week, storageService.load(year,filename).toFile(), fitsMissing, skusMissing);
    	
    	if(fitsMissing.size() > 0){
    		storageService.delete(year, filename);
    		
    		StockMissing missing = new StockMissing("FITS_MISSING");
    		missing.setFitsMissing(fitsMissing);
    		return new ResponseEntity<StockMissing>(missing, HttpStatus.CONFLICT);
    	}else if(skusMissing.size() > 0){
    		storageService.delete(year, filename);
    		
    		StockMissing missing = new StockMissing("SKUS_MISSING");
    		missing.setSkusMissing(skusMissing);
    		return new ResponseEntity<StockMissing>(missing, HttpStatus.CONFLICT);
    	}
    	return new ResponseEntity<Void>(HttpStatus.OK);
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }

}
