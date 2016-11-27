package com.example.vmi.restcontroller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MiscController {

	@RequestMapping(value = {"/"})
	public String index(){
		return "index";
	}
}
