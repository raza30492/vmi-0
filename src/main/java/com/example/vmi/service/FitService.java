package com.example.vmi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.exception.InconsistentEditException;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.SKURepository;
import com.example.vmi.repository.StockDetailsRepository;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class FitService {
    private final Logger logger = LoggerFactory.getLogger(BuyerService.class);
    
    @Autowired FitRepository fitRepository;
    
    @Autowired SKURepository skuRepository;
    
    @Autowired StockDetailsRepository stockRepository;

    public Fit findOne(Integer id) {
        return fitRepository.findOne(id);
    }
    
    public Fit findOne(String name) {
        return fitRepository.findByName(name);
    }
    
    @Transactional
    public Fit updateFit(Fit fit){
    	List<SKU> skus = skuRepository.findByFit(fit);
    	for(SKU sku : skus){
            if(stockRepository.countBySku(sku) > 0){
                throw new InconsistentEditException("Updation restricted to prevent data Inconsistency.");
            }
    	}
        Fit fit2 = fitRepository.findOne(fit.getId());
        fit2.setName(fit.getName());
        return fit2;
    }

}
