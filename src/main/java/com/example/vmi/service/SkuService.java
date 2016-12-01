package com.example.vmi.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.StringReader;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.SKURepository;
import com.example.vmi.util.CsvUtil;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;

@Service
public class SkuService {
	
	@Autowired FitRepository fitRepository;
	@Autowired SKURepository skuRepository;
	
	public void addBatch(String fitName, MultipartFile file){
		try{
			//Convert to File
			File input = new File(file.getOriginalFilename());
			input.createNewFile();
			FileOutputStream os = new FileOutputStream(input);
			os.write(file.getBytes());
			os.close();
			//Convert to csv String
			String output = null;
			if(input.getName().contains("xlsx")){
				output = CsvUtil.fromXlsx(input);
			}else if(input.getName().contains("xls")){
				output = CsvUtil.fromXls(input);
			}
			//Read as Bean from csv String
			CSVReader reader = new CSVReader(new StringReader(output));
            HeaderColumnNameMappingStrategy<SKU> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(SKU.class);
            CsvToBean<SKU> csvToBean = new CsvToBean<>();
            List<SKU> list = csvToBean.parse(strategy, reader);
            
            Fit fit = fitRepository.findByName(fitName);
            for(SKU sku: list){
            	sku.setFit(fit);
            }
            skuRepository.save(list);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
