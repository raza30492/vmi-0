package com.example.vmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vmi.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
	
}
