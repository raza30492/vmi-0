package com.example.vmi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vmi.entity.Buyer;
import com.example.vmi.repository.BuyerRepository;

@Service
@Transactional(readOnly = true)
public class BuyerService {
	
	@Autowired BuyerRepository buyerRepository;

	public Buyer findOne(String name){
		return buyerRepository.findByName(name);
	}
}
