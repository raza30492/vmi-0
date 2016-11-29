package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.vmi.entity.Buyer;

@PreAuthorize("hasRole('ROLE_ADMIN')")
public interface BuyerRepository extends JpaRepository<Buyer, Integer> {
	
	public Buyer findByName(String name);
	
}
