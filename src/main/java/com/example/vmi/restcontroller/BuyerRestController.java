package com.example.vmi.restcontroller;

import com.example.vmi.service.BuyerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RepositoryRestController
public class BuyerRestController {
    private final Logger logger = LoggerFactory.getLogger(BuyerRestController.class);
    
    @Autowired BuyerService buyerService;
    
    @DeleteMapping(value = "/buyers/{id}")
    public ResponseEntity<?> deleteBuyer(@PathVariable("id") Integer id){
        logger.info("deleteBuyer(): /buyers/" + id);
        if(buyerService.findOne(id) != null){
            buyerService.delete(id);
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }
}
