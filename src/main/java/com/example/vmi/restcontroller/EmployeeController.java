package com.example.vmi.restcontroller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.codec.Base64;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.vmi.dto.Credential;
import com.example.vmi.dto.User;
import com.example.vmi.entity.Employee;
import com.example.vmi.service.EmployeeService;

@RestController
@RequestMapping("/api/emps")
public class EmployeeController {
	
	@Autowired EmployeeService employeeService;

	@PostMapping
	public ResponseEntity<?> save(@RequestBody User user){
		if((employeeService.findOne(user.getId()) != null )|| (employeeService.findOne(user.getEmail()) != null)){
			return new ResponseEntity<Void>(HttpStatus.CONFLICT);
		}
		Employee employee = employeeService.save(user);
		if( employee != null){
			return new ResponseEntity<Employee>(employee, HttpStatus.CREATED);
		}
		return new ResponseEntity<Void>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@RequestMapping(value = "/logon",method = RequestMethod.POST)
	public ResponseEntity<?> logon(@RequestBody Credential credential, HttpServletRequest req){
		
		Employee employee = employeeService.authenticate(credential.getEmail(), credential.getPassword());
		Map<String, String> response = new HashMap<>();
		if(employee != null){
			String basic = credential.getEmail() + ":" + credential.getPassword();
			
			response.put("token", new String(Base64.encode(basic.getBytes())));
			response.put("username", employee.getName());
			response.put("role", employee.getRole().getValue());
			if(employee.getBuyer() != null){
				response.put("buyerName", employee.getBuyer().getName());
				response.put("buyerHref",req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort() + "/api/buyers/" + employee.getBuyer().getId());
			}
			return new ResponseEntity<>(response, HttpStatus.OK);
		}else{
			return new ResponseEntity<Void>(HttpStatus.UNAUTHORIZED);
		}
		
	}
}
