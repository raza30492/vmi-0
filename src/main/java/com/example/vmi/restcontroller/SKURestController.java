package com.example.vmi.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.vmi.service.SkuService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.rest.webmvc.RepositoryRestController;

@RepositoryRestController
public class SKURestController {
    private final Logger logger = LoggerFactory.getLogger(SKURestController.class);
    
    @Autowired private SkuService skuService;

    @PostMapping("/skus/upload")
    public ResponseEntity<Void> uploadSku(@RequestParam("fit") String fit, @RequestParam("file") MultipartFile file) {
        logger.info("uploadSku(): /skus/upload");
        if (!file.isEmpty()) {
            skuService.addBatch(fit, file);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
