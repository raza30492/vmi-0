package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.vmi.entity.Buyer;
import java.util.List;

@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MERCHANT') or hasRole('ROLE_USER')")
public interface BuyerRepository extends JpaRepository<Buyer, Integer> {

    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MERCHANT') or hasRole('ROLE_USER')")
    public Buyer findByName(String name);
    
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MERCHANT') or hasRole('ROLE_USER')")
    public List<Buyer> findAll();
    
    
}
