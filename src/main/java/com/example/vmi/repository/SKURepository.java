package com.example.vmi.repository;

import com.example.vmi.entity.Fit;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.vmi.entity.SKU;

@RepositoryRestResource(collectionResourceRel = "skus", itemResourceRel = "sku", path = "skus")
@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MERCHANT') or hasRole('ROLE_USER')")
public interface SKURepository extends JpaRepository<SKU, Long> {

    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER') or hasRole('ROLE_MERCHANT')")
    List<SKU> findByFitName(@Param("fitName") String fitName);

    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER') or hasRole('ROLE_MERCHANT')")
    List<SKU> findByFit(Fit fit);

    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER') or hasRole('ROLE_MERCHANT')")
    SKU findByNameAndFitName(String skuName, String fitName);
    
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER') or hasRole('ROLE_MERCHANT')")
    Long countByFit(Fit fit);
}
