package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vmi.entity.Fit;

public interface FitRepository extends JpaRepository<Fit, Integer> {
	public Fit findByName(String name);
}
