package com.example.vmi.restcontroller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import com.example.vmi.service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class MiscController {
    
    private final Logger logger = LoggerFactory.getLogger(MiscController.class );

    @Autowired
    EmployeeService employeeService;

    @RequestMapping(value = {"/"})
    public String index() {
        logger.info("Home Page");
        return "index";
    }

}
