package com.example.vmi.entity.projections;

import org.springframework.data.rest.core.config.Projection;

import com.example.vmi.entity.Buyer;
import com.example.vmi.entity.Employee;

@Projection(name = "inlineBuyer", types = { Employee.class })
public interface InlineBuyer {
	Long getId();
	String getName();
	String getEmail();
	String getRole();
	String getMobile();
	Buyer getBuyer();
}
