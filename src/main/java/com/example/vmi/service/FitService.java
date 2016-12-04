package com.example.vmi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vmi.entity.Fit;
import com.example.vmi.repository.FitRepository;

@Service
@Transactional(readOnly = true)
public class FitService {
	
	@Autowired FitRepository fitRepository;
	
	public Fit findOne(String name){
		return fitRepository.findByName(name);
	}

}
