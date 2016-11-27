package com.example.vmi.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.StringReader;
import java.util.Iterator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.vmi.entity.Buyer;
import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.repository.BuyerRepository;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.SKURepository;
import com.example.vmi.util.CsvUtil;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;

@Service
public class SkuService {
	
	@Autowired BuyerRepository buyerRepository;
	@Autowired FitRepository fitRepository;
	@Autowired SKURepository skuRepository;
	
	public void addBatch(String buyerName, String fitName, MultipartFile file){
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
            
            Buyer buyer = buyerRepository.findByName(buyerName);
            Fit fit = fitRepository.findByName(fitName);
 
            for(SKU sku: list){
            	sku.setBuyer(buyer);
            	sku.setFit(fit);
            	
            }
            List<SKU> result = skuRepository.save(list);
            Iterator<SKU> itr = result.iterator();
            while(itr.hasNext()){
                System.out.println(itr.next());
            }
 
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
