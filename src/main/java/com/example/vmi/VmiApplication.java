package com.example.vmi;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import com.example.vmi.storage.StorageProperties;
import com.example.vmi.storage.StorageService;



@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class VmiApplication {

	public static void main(String[] args) {
		SpringApplication.run(VmiApplication.class, args);
	}
	
	@Bean
	CommandLineRunner init(StorageService storageService) {
		return (args) -> {
            storageService.deleteAll();
            storageService.init();
		};
	}
}
