package com.example.vmi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vmi.entity.Buyer;
import com.example.vmi.entity.Employee;
import com.example.vmi.repository.BuyerRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class BuyerService {
    private final Logger logger = LoggerFactory.getLogger(BuyerService.class);
    
    @Autowired BuyerRepository buyerRepository;

    public Buyer findOne(String name) {
        return buyerRepository.findByName(name);
    }
    
    @Transactional
    public void delete(Integer id){
        logger.info("delete(), id:" + id);
        Buyer buyer = buyerRepository.findOne(id);
        Hibernate.initialize(buyer.getEmployees());
        for(Employee employee : buyer.getEmployees()){
            employee.setBuyer(null);
        }
        buyerRepository.delete(id);
    }
}
