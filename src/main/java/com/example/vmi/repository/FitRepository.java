package com.example.vmi.repository;

import com.example.vmi.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.vmi.entity.Fit;
import java.util.List;
import org.springframework.data.repository.query.Param;

@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER') or hasRole('ROLE_MERCHANT')")
public interface FitRepository extends JpaRepository<Fit, Integer> {

    public Fit findByName(String name);
    
    public List<Fit> findByBuyer(Buyer buyer);
    
    public List<Fit> findByBuyerName(@Param("buyerName") String buyerName);

}
