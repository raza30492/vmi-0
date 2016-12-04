package com.example.vmi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.entity.StockDetails;

@RepositoryRestResource(exported = false)
public interface StockDetailsRepository extends JpaRepository<StockDetails, Long> {
	
	List<StockDetails> findByYearAndWeekAndSkuFitName(int year, int week, String fitName);
	StockDetails findByYearAndWeekAndSku(int year, int week, SKU sku);
	List<StockDetails> deleteByYearAndWeek(int year, int week);
	
}
