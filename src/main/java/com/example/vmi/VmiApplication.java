package com.example.vmi;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;

import com.example.vmi.entity.Employee;
import com.example.vmi.entity.Role;
import com.example.vmi.repository.EmployeeRepository;
import com.example.vmi.storage.StorageProperties;
import com.example.vmi.storage.StorageService;



@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class VmiApplication {

	public static void main(String[] args) {
		SpringApplication.run(VmiApplication.class, args);
	}
	
	@Bean
	CommandLineRunner init(StorageService storageService, EmployeeRepository employeeRepository) {
		return (args) -> {
            storageService.deleteAll();
            storageService.init();
            employeeRepository.save(new Employee(55555L,"Md Zahid Raza","zahid7292@gmail.com","admin",Role.ADMIN,"8987525008"));
		};
	}
}
