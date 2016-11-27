package com.example.vmi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.example.vmi.entity.SKU;

@RepositoryRestResource(collectionResourceRel = "skus", itemResourceRel = "sku", path = "skus")
public interface SKURepository extends JpaRepository<SKU, Long> {
	List<SKU> findByFitName(@Param("fitName") String fitName);
}
