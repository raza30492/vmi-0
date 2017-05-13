package com.example.vmi;

import java.util.ArrayList;
import java.util.List;

import org.dozer.DozerBeanMapper;
import org.dozer.Mapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

import com.example.vmi.dto.User;
import com.example.vmi.service.EmployeeService;
import com.example.vmi.storage.ProposalStorageService;
import com.example.vmi.storage.StockDetailStorageService;
import com.example.vmi.storage.StorageProperties;
import com.example.vmi.storage.TemplateStorageService;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class VmiApplication extends SpringBootServletInitializer {
    
    public VmiApplication(){
        super();
        setRegisterErrorPageFilter(false);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(VmiApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(VmiApplication.class, args);
    }

    @Bean
    CommandLineRunner init(
            StockDetailStorageService stockDetailStorageService,
            ProposalStorageService proposalStorageService,
            TemplateStorageService templateStorageService,
            EmployeeService employeeService) {

        return (args) -> {
            stockDetailStorageService.init();
            proposalStorageService.init();
            templateStorageService.init();
            employeeService.save(new User(55555L, "Md Zahid Raza", "zahid7292@gmail.com", "8987525008", "ROLE_ADMIN"));
        };
    }
    
    @Bean
    public Mapper dozerBeanMapper() {
        List<String> list = new ArrayList<>();
        list.add("dozer_mapping.xml");
        return new DozerBeanMapper(list);
    }
}
