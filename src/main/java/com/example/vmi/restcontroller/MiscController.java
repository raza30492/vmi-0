package com.example.vmi.restcontroller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.codec.Base64;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.vmi.dto.Credential;
import com.example.vmi.entity.Employee;
import com.example.vmi.service.EmployeeService;

@Controller
public class MiscController {
	
	@Autowired EmployeeService employeeService;

	@RequestMapping(value = {"/"})
	public String index(){
		return "index";
	}

}
