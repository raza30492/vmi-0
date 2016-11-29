package com.example.vmi.repository;

import java.util.List;
import java.lang.Iterable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.vmi.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
	
	@RestResource(exported = false)
	public Employee findByEmail(String email);

	@RestResource(exported = false)
	Employee save(Employee entity);

	@RestResource(exported = false)
	Employee saveAndFlush(Employee entity);

	@RestResource(exported = false)
	<S extends Employee> List<S> save(Iterable<S> entities) ;

}
