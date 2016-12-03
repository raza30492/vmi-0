package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.example.vmi.entity.StockDetails;

@RepositoryRestResource(path = "stocks", collectionResourceRel = "stocks", itemResourceRel = "stock")
public interface StockDetailsRepository extends JpaRepository<StockDetails, Long> {

}
