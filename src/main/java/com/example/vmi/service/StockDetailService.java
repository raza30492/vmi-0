package com.example.vmi.service;

import java.io.File;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.dozer.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.vmi.dto.Stock;
import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.entity.StockDetails;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.SKURepository;
import com.example.vmi.repository.StockDetailsRepository;
import com.example.vmi.util.CsvUtil;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;

@Service
@Transactional
public class StockDetailService {
	
	@Autowired Mapper mapper;
	
	@Autowired FitRepository fitRepository;
	
	@Autowired SKURepository skuRepository;
	
	@Autowired StockDetailsRepository stockDetailsRepository;

	public void addBatch(Integer year, Integer week, File file, List<String> fitsMissing, List<SKU> skusMissing){
		try{
			//Convert to csv String
			String output = null;
			if(file.getName().contains("xlsx")){
				output = CsvUtil.fromXlsx(file);
			}else if(file.getName().contains("xls")){
				output = CsvUtil.fromXls(file);
			}

			//Read as Bean from csv String
			CSVReader reader = new CSVReader(new StringReader(output));
            HeaderColumnNameMappingStrategy<Stock> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(Stock.class);
            CsvToBean<Stock> csvToBean = new CsvToBean<>();
            List<Stock> list = csvToBean.parse(strategy, reader);
            
            //Check if Each Fit exists
            Fit fit = null;
            for(Stock stk: list){
            	if(stk.getSkuName() == null && stk.getFit() == null) continue;
            	
            	fit = fitRepository.findByName(stk.getFit());
            	if(fit == null){
            		fitsMissing.add(stk.getFit());
            	}
            }
            if(fitsMissing.size() > 0)	return;
            
            //Check if each SKU exists
            SKU sku = null;
            for(Stock stk: list){
            	if(stk.getSkuName() == null && stk.getFit() == null) continue;
            	
            	sku = skuRepository.findByNameAndFitName(stk.getSkuName(), stk.getFit());
            	if(sku == null){
            		System.out.println("check");
            		fit = fitRepository.findByName(stk.getFit());
            		skusMissing.add(new SKU(stk.getSkuName(), fit));
            	}
            }
            if(skusMissing.size() > 0) return;
            
            
            //Convert from DTO to Entity
            List<StockDetails> stocks = new ArrayList<>();
            for(Stock stk: list){
            	if(stk.getSkuName() == null && stk.getFit() == null) continue;
            	
            	StockDetails stock = mapper.map(stk, StockDetails.class);
            	sku = skuRepository.findByNameAndFitName(stk.getSkuName(), stk.getFit());
            	stock.setSku(sku);
            	stock.setYear(year);
            	stock.setWeek(week);
            	
            	stocks.add(stock);
            }
            
            stockDetailsRepository.save(stocks);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	public void delete(int year, int week){
		stockDetailsRepository.deleteByYearAndWeek(year, week);
	}
	
}
