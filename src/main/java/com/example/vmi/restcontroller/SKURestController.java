package com.example.vmi.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
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
    
    @PutMapping(value = {"/skus/{id}"})
    public ResponseEntity<?> updateSku(@PathVariable("id") long id,@RequestBody SKU sku){
        logger.info("updateSku(): /skus/" + id);
        if(sku.getId() != null && id != sku.getId()){
            return new ResponseEntity<>("Sku id mismatch.", HttpStatus.CONFLICT);
        }else if(skuService.findOne(id) == null){
            return new ResponseEntity<>("SKU not found.", HttpStatus.NOT_FOUND);
        }else{
            sku.setId(id);
            sku = skuService.updateSku(sku);
            return new ResponseEntity<>(sku, HttpStatus.OK);
        }
    }
    
    @DeleteMapping(value = {"/skus/byFit"})
    public ResponseEntity<?> deleteBatch(@RequestParam("fitName") String fitName){
        logger.info("deleteBatch(): /skus/" + fitName);
        skuService.deleteBatch(fitName);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
}
