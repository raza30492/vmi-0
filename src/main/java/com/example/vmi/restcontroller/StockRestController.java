package com.example.vmi.restcontroller;

import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import com.example.vmi.dto.Error;
import com.example.vmi.entity.Buyer;
import com.example.vmi.service.BuyerService;
import com.example.vmi.service.StockDetailService;
import com.example.vmi.storage.StockDetailStorageService;
import com.example.vmi.util.MiscUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
public class StockRestController {
    private final Logger logger = LoggerFactory.getLogger(StockRestController.class);
    
    @Autowired private StockDetailStorageService storageService;

    @Autowired private StockDetailService stockDetailService;

    @Autowired private BuyerService buyerService;

    @GetMapping("/{year}")
    public ResponseEntity<?> listUploadedFiles(@RequestParam("buyer") String buyerName, @PathVariable int year) throws IOException {
        logger.info("listUploadedFiles(): /stock/" + year);
        Buyer buyer = buyerService.findOne(buyerName);
        List<Map<String, String>> list = storageService.loadAll(buyer.getId(), year)
                .map(
                    (path) -> {
                        Map<String, String> hashmap = new HashedMap<>();
                        hashmap.put("filename", path.getFileName().toString());
                        String href = MvcUriComponentsBuilder
                        .fromMethodName(StockRestController.class, "serveFile", path.getFileName().toString(), buyerName, year)
                        .build().toString();
                        hashmap.put("href", href);
                        return hashmap;
                    }
                ).collect(Collectors.toList());

        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename, @RequestParam("buyer") String buyerName, @RequestParam("year") int year) {
        logger.info("serveFile(): /stock/files/" + filename);
        Buyer buyer = buyerService.findOne(buyerName);
        Resource file = storageService.loadAsResource(buyer.getId(), year, filename);
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @DeleteMapping("/files/{filename:.+}")
    public ResponseEntity<Void> deleteFile(@PathVariable String filename, @RequestParam("buyer") String buyerName, @RequestParam("year") int year) {
        logger.info("deleteFile(): /stock/files/" + filename);
        Buyer buyer = buyerService.findOne(buyerName);
        storageService.delete(buyer.getId(), year, filename);
        int week = MiscUtil.getWeekFromFilename(filename);
        stockDetailService.delete(year, week);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }

    @PostMapping("/")
    public ResponseEntity<?> uploadStock(@RequestParam("buyer") String buyerName, @RequestParam("year") Integer year, @RequestParam("week") Integer week, @RequestParam("file") MultipartFile file) {
        logger.info("uploadStock(): /stocks/");
        Buyer buyer = buyerService.findOne(buyerName);
        String filename = null;
        if (file.getOriginalFilename().contains("xlsx")) {
            filename = "Sales_Week" + week + "_Year" + year + ".xlsx";
        } else if (file.getOriginalFilename().contains("xls")) {
            filename = "Sales_Week" + week + "_Year" + year + ".xls";
        } else {
            return new ResponseEntity<>(new Error("FILE_NOT_SUPPORTED"), HttpStatus.CONFLICT);
        }

        try {
            storageService.store(buyer.getId(), year, file, filename);
        } catch (FileAlreadyExistsException e) {
            return new ResponseEntity<>(new Error("FILE_ALREADY_EXIST"), HttpStatus.CONFLICT);
        }

        Error error = new Error();
        stockDetailService.addBatch(year, week, storageService.load(buyer.getId(), year, filename).toFile(), error);
        if (error.getCode() != null) {
            System.out.println("check");
            storageService.delete(buyer.getId(), year, filename);
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
