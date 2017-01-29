package com.example.vmi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vmi.entity.Buyer;
import com.example.vmi.entity.Employee;
import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.entity.StockDetails;
import com.example.vmi.repository.BuyerRepository;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.SKURepository;
import com.example.vmi.repository.StockDetailsRepository;
import java.util.List;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class BuyerService {
    private final Logger logger = LoggerFactory.getLogger(BuyerService.class);
    
    @Autowired BuyerRepository buyerRepository;
    
    @Autowired FitRepository fitRepository;
    
    @Autowired SKURepository skuRepository;
    
    @Autowired StockDetailsRepository stockDetailsRepository;

    public Buyer findOne(Integer id){
        return buyerRepository.findOne(id);
    }
    
    public Buyer findOne(String name) {
        return buyerRepository.findByName(name);
    }
    
    @Transactional
    public void delete(Integer id){
        logger.info("delete(), id:" + id);
        Buyer buyer = buyerRepository.findOne(id);
        if(buyer == null) return;
        //Remove foreign key from employees
        Hibernate.initialize(buyer.getEmployees());
        for(Employee employee : buyer.getEmployees()){
            employee.setBuyer(null);
        }
        //Delete All Fits, SKUS and StockDetails related to this Buyer
        List<Fit> fits = fitRepository.findByBuyer(buyer);
        System.out.println("Number of fits:" + fits);
        for(Fit fit : fits){
            List<SKU> skus = skuRepository.findByFit(fit);
            System.out.println("Number of skus: " + skus.size());
            for(SKU sku: skus){
                List<StockDetails> stocks = stockDetailsRepository.findBySku(sku);
                System.out.println("Number of Stocks: " + stocks.size());
                stockDetailsRepository.deleteInBatch(stocks);
            }
            skuRepository.deleteInBatch(skus);
        }
        fitRepository.deleteInBatch(fits);
        buyerRepository.delete(id);
        //buyerRepository.findA
    }
}
