package com.example.vmi.service;

import java.io.File;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import javax.transaction.Transactional;
import org.dozer.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.vmi.dto.Error;
import com.example.vmi.dto.SKUMissing;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class StockDetailService {

    private final Logger logger = LoggerFactory.getLogger(BuyerService.class);

    @Autowired Mapper mapper;

    @Autowired FitRepository fitRepository;

    @Autowired SKURepository skuRepository;

    @Autowired StockDetailsRepository stockDetailsRepository;

    public void addBatch(Integer year, Integer week, File file, Error error) {
        //Convert to csv String
        String output = null;
        if (file.getName().contains("xlsx")) {
            output = CsvUtil.fromXlsx(file);
        } else if (file.getName().contains("xls")) {
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
        List<String> fitsMissing = new ArrayList<>();
        for (Stock stk : list) {
            if (stk.getSkuName() == null && stk.getFit() == null) {
                continue;
            }
            fit = fitRepository.findByName(stk.getFit());
            if (fit == null) {
                fitsMissing.add(stk.getFit());
            }
        }
        if (fitsMissing.size() > 0) {
            logger.info(fitsMissing.size() + " Fits are missing.");
            error.setCode("FITS_MISSING");
            error.setFitsMissing(fitsMissing);
            return;
        }

        //Check if each SKU exists
        SKU sku = null;
        List<SKUMissing> skusMissing = new ArrayList<>();
        for (Stock stk : list) {
            if (stk.getSkuName() == null && stk.getFit() == null) {
                continue;
            }
            sku = skuRepository.findByNameAndFitName(stk.getSkuName(), stk.getFit());
            if (sku == null) {
                fit = fitRepository.findByName(stk.getFit());
                skusMissing.add(new SKUMissing(fit.getName(), stk.getSkuName()));
            }
        }
        if (skusMissing.size() > 0) {
            logger.info(skusMissing.size() + " SKUS are missing.");
            error.setCode("SKUS_MISSING");
            error.setSkusMissing(skusMissing);
            return;
        }

        //Convert from DTO to Entity
        List<StockDetails> stocks = new ArrayList<>();
        for (Stock stk : list) {
            if (stk.getSkuName() == null && stk.getFit() == null) {
                continue;
            }
            StockDetails stock = mapper.map(stk, StockDetails.class);
            sku = skuRepository.findByNameAndFitName(stk.getSkuName(), stk.getFit());
            stock.setSku(sku);
            stock.setYear(year);
            stock.setWeek(week);

            stocks.add(stock);
        }
        stockDetailsRepository.save(stocks);
    }

    public void delete(int year, int week) {
        stockDetailsRepository.deleteByYearAndWeek(year, week);
    }
}
