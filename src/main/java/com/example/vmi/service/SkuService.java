package com.example.vmi.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.vmi.entity.Fit;
import com.example.vmi.entity.SKU;
import com.example.vmi.exception.InconsistentEditException;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.SKURepository;
import com.example.vmi.repository.StockDetailsRepository;
import com.example.vmi.util.CsvUtil;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class SkuService {
    private final Logger logger = LoggerFactory.getLogger(BuyerService.class);
    
    @Autowired FitRepository fitRepository;
    
    @Autowired SKURepository skuRepository;
    
    @Autowired StockDetailsRepository stockRepository;
    public SKU findOne(Long id){
    	return skuRepository.findOne(id);
    }
    
    @Transactional
    public SKU updateSku(SKU sku){
    	if(stockRepository.countBySku(sku) > 0){
    		throw new InconsistentEditException("Updation restricted to prevent data inconsistency");
    	}
    	SKU sku2 = skuRepository.findOne(sku.getId());
    	sku2.setName(sku.getName());
    	return sku2;
    }

    @Transactional
    public void addBatch(String fitName, MultipartFile file) {
        logger.info("addBatch()");
        try {
            //Convert to File
            File input = new File(file.getOriginalFilename());
            input.createNewFile();
            FileOutputStream os = new FileOutputStream(input);
            os.write(file.getBytes());
            os.close();
            //Convert to csv String
            String output = null;
            if (input.getName().contains("xlsx")) {
                output = CsvUtil.fromXlsx(input);
            } else if (input.getName().contains("xls")) {
                output = CsvUtil.fromXls(input);
            }
            input.delete();
            //System.out.println(output);
            //Read as Bean from csv String
            CSVReader reader = new CSVReader(new StringReader(output));
            HeaderColumnNameMappingStrategy<SKU> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(SKU.class);
            CsvToBean<SKU> csvToBean = new CsvToBean<>();
            List<SKU> list = csvToBean.parse(strategy, reader);
            List<SKU> removeList = new ArrayList<>();
            Fit fit = fitRepository.findByName(fitName);
            for (SKU sku : list) {
                if (sku.getName() == null) {
                    removeList.add(sku);
                    continue;
                }
                sku.setFit(fit);
            }
            for (SKU sku : removeList) {
                list.remove(sku);
            }
            skuRepository.save(list);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @Transactional
    public void deleteBatch(String fitName){
        Fit fit = fitRepository.findByName(fitName);
        skuRepository.deleteByFit(fit);
    }
}
