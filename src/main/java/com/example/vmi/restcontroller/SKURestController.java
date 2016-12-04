package com.example.vmi.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.vmi.service.SkuService;
import com.example.vmi.storage.StorageFileNotFoundException;

@RestController
@RequestMapping("/api/sku")
public class SKURestController {

    @Autowired private SkuService skuService;

    @PostMapping("/upload")
    public ResponseEntity<Void> uploadSku(@RequestParam("fit") String fit, @RequestParam("file") MultipartFile file ) {
    	if(!file.isEmpty()){
    		skuService.addBatch(fit, file);
    	}
    	return new ResponseEntity<Void>(HttpStatus.OK);
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }

}

