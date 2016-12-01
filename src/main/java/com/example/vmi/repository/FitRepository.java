package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.vmi.entity.Fit;

@PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_MERCHANT')")
public interface FitRepository extends JpaRepository<Fit, Integer> {
	public Fit findByName(String name);
}
