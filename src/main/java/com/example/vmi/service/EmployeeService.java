package com.example.vmi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.vmi.dto.User;
import com.example.vmi.entity.Employee;
import com.example.vmi.entity.Role;
import com.example.vmi.repository.BuyerRepository;
import com.example.vmi.repository.EmployeeRepository;

@Service
public class EmployeeService {
	
	@Autowired EmployeeRepository employeeRepository;
	
	@Autowired BuyerRepository buyerRepository;
	
	public Employee findOne(Long id){
		return employeeRepository.findOne(id);
	}
	
	public Employee findOne(String email){
		return employeeRepository.findByEmail(email);
	}
	
	public Employee authenticate(String email, String password){
		Employee employee = employeeRepository.findByEmail(email);
		PasswordEncoder encoder = new BCryptPasswordEncoder();
		if(employee != null && encoder.matches(password, employee.getPassword())){
			return employee;
		}
		return null;
	}
	
	public Employee save(User user){
		Employee employee = new Employee(user.getId(), user.getName(), user.getEmail(), user.getMobile(), Role.parse(user.getRole()), user.getMobile());
		if(user.getBuyer() != null){
			employee.setBuyer(buyerRepository.findByName(user.getBuyer()));
		}
		return employeeRepository.save(employee);
	}
}
