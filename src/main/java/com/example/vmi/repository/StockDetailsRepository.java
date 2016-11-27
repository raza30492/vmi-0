package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vmi.entity.StockDetails;

public interface StockDetailsRepository extends JpaRepository<StockDetails, Long> {

}
