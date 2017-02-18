package com.example.vmi.util;

import com.example.vmi.dto.Proposal;
import com.sun.javafx.scene.control.skin.VirtualFlow;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CsvUtil {
    private static final Logger logger = LoggerFactory.getLogger(CsvUtil.class);
    
    public static String fromXlsx(File input) {
        logger.info("fromXlsx()");
        StringBuilder builder = new StringBuilder();
        String output = null;
        try {
            XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(input));
            XSSFSheet sheet = wb.getSheetAt(0);

            for (Row row : sheet) {
                //row.getL
                for (Cell cell : row) {
                    switch (cell.getCellTypeEnum()) {
                        case STRING:
                            builder.append(cell.getRichStringCellValue().getString());
                            builder.append(",");
                            break;
                        case NUMERIC:
                            builder.append(cell.getNumericCellValue());
                            builder.append(",");
                            break;
                        case BOOLEAN:
                            builder.append(cell.getBooleanCellValue());
                            builder.append(",");
                            break;
                        case BLANK:
                            builder.append(" ,");
                            break;
                        default:
                    }
                }
                builder.append("\n");
            }
            output = builder.toString();

        } catch (Exception e) {
            logger.info("Error converting xlsx to csv", e.getMessage());
        }
        return output;
    }

    public static String fromXls(File input) {
        StringBuilder builder = new StringBuilder();
        String output = null;
        try {
            HSSFWorkbook wb = new HSSFWorkbook(new FileInputStream(input));
            HSSFSheet sheet = wb.getSheetAt(0);

            for (Row row : sheet) {
                for (Cell cell : row) {
                    switch (cell.getCellTypeEnum()) {
                        case STRING:
                            builder.append(cell.getRichStringCellValue().getString());
                            builder.append(",");
                            break;
                        case NUMERIC:
                            builder.append(cell.getNumericCellValue());
                            builder.append(",");
                            break;
                        case BOOLEAN:
                            builder.append(cell.getBooleanCellValue());
                            builder.append(",");
                            break;
                        case BLANK:
                            builder.append(" ,");
                            break;
                        default:
                    }
                }
                builder.append("\n");
            }
            output = builder.toString();

        } catch (Exception e) {
            logger.info("Error converting xls to csv", e.getMessage());
        }
        return output;
    }
    
    public static List<Proposal> proposalListFromXlsx(File input) {
        logger.info("proposalListFromXlsx()");
        List<Proposal> list = new ArrayList<>();
        try {
            XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(input));
            XSSFSheet sheet = wb.getSheetAt(0);
            
            int noOfColumns = sheet.getRow(0).getLastCellNum();
            int value = 23 - noOfColumns;
            Proposal proposal = null;
            for (Row row : sheet) {
                if(row.getRowNum() == 0) continue;
                
                proposal = new Proposal();
                int j = -1;
                Cell cell = null;
                for(int i = 1; i < noOfColumns; i++){
                    cell = row.getCell(i);
                    if(i > 3){
                        j = i + value;
                    }
                    switch(j){
                        case 1 : proposal.setSkuName(cell.getStringCellValue());
                            break;
                        case 2 : proposal.setFitName(cell.getStringCellValue());
                            break;
                        case 3 : proposal.setCumSale1((int)cell.getNumericCellValue());
                            break;
                        case 4 : proposal.setCumSaleWk1((int)cell.getNumericCellValue());
                            break;
                        case 5 : proposal.setCumSaleWk2((int)cell.getNumericCellValue());
                            break;
                        case 6 : proposal.setCumSaleWk3((int)cell.getNumericCellValue());
                            break;
                        case 7 : proposal.setCumSaleWk4((int)cell.getNumericCellValue());
                            break;
                        case 8 : proposal.setCumSale0((int)cell.getNumericCellValue());
                            break;
                        case 9 : proposal.setTotalCumSale((int)cell.getNumericCellValue());
                            break;
                        case 10 : proposal.setCumSaleRatio(cell.getNumericCellValue());
                            break;
                        case 11 : proposal.setSkuSaleRatio(cell.getNumericCellValue());
                            break;
                        case 12 : proposal.setSkuSaleRatioFor12Weeks((int)cell.getNumericCellValue());
                            break;
                        case 13 : proposal.setBackOrder((int)cell.getNumericCellValue());
                            break;
                        case 14 : proposal.setBackOrderPlus12WeekSale((int)cell.getNumericCellValue());
                            break;
                        case 15 : proposal.setSeasonIntakeProposal((int)cell.getNumericCellValue());
                            break;
                        case 16 : proposal.setOnStock((int)cell.getNumericCellValue());
                            break;
                        case 17 : proposal.setOnOrder((int)cell.getNumericCellValue());
                            break;
                        case 18 :
                            break;
                        case 19 : proposal.setCalValue1((int)cell.getNumericCellValue());
                            break;
                        case 20 : proposal.setCalValue2((int)cell.getNumericCellValue());
                            break;
                        case 21 : proposal.setCalValue3((int)cell.getNumericCellValue());
                            break;
                        case 22 : proposal.setCalValue4((int)cell.getNumericCellValue());
                            break;
                     
                    }
                    list.add(proposal);
                }

            }

        } catch (Exception e) {
            logger.info("Error reading Proposal objects from " + input.getName() + ".xlsx", e.getMessage());
        }
        return list;
    }
    
    public static List<Proposal> proposalListFromXls(File input) {
        logger.info("proposalListFromXls()");
        List<Proposal> list = new ArrayList<>();
        try {
            HSSFWorkbook wb = new HSSFWorkbook(new FileInputStream(input));
            HSSFSheet sheet = wb.getSheetAt(0);
            
            int noOfColumns = sheet.getRow(0).getLastCellNum();
            int value = 23 - noOfColumns;
            Proposal proposal = null;
            for (Row row : sheet) {
                if(row.getRowNum() == 0) continue;
                
                proposal = new Proposal();
                int j = -1;
                Cell cell = null;
                for(int i = 1; i < noOfColumns; i++){
                    cell = row.getCell(i);
                    if(i > 3){
                        j = i + value;
                    }
                    switch(j){
                        case 1 : proposal.setSkuName(cell.getStringCellValue());
                            break;
                        case 2 : proposal.setFitName(cell.getStringCellValue());
                            break;
                        case 3 : proposal.setCumSale1((int)cell.getNumericCellValue());
                            break;
                        case 4 : proposal.setCumSaleWk1((int)cell.getNumericCellValue());
                            break;
                        case 5 : proposal.setCumSaleWk2((int)cell.getNumericCellValue());
                            break;
                        case 6 : proposal.setCumSaleWk3((int)cell.getNumericCellValue());
                            break;
                        case 7 : proposal.setCumSaleWk4((int)cell.getNumericCellValue());
                            break;
                        case 8 : proposal.setCumSale0((int)cell.getNumericCellValue());
                            break;
                        case 9 : proposal.setTotalCumSale((int)cell.getNumericCellValue());
                            break;
                        case 10 : proposal.setCumSaleRatio(cell.getNumericCellValue());
                            break;
                        case 11 : proposal.setSkuSaleRatio(cell.getNumericCellValue());
                            break;
                        case 12 : proposal.setSkuSaleRatioFor12Weeks((int)cell.getNumericCellValue());
                            break;
                        case 13 : proposal.setBackOrder((int)cell.getNumericCellValue());
                            break;
                        case 14 : proposal.setBackOrderPlus12WeekSale((int)cell.getNumericCellValue());
                            break;
                        case 15 : proposal.setSeasonIntakeProposal((int)cell.getNumericCellValue());
                            break;
                        case 16 : proposal.setOnStock((int)cell.getNumericCellValue());
                            break;
                        case 17 : proposal.setOnOrder((int)cell.getNumericCellValue());
                            break;
                        case 18 :
                            break;
                        case 19 : proposal.setCalValue1((int)cell.getNumericCellValue());
                            break;
                        case 20 : proposal.setCalValue2((int)cell.getNumericCellValue());
                            break;
                        case 21 : proposal.setCalValue3((int)cell.getNumericCellValue());
                            break;
                        case 22 : proposal.setCalValue4((int)cell.getNumericCellValue());
                            break;
                     
                    }
                    list.add(proposal);
                }

            }

        } catch (Exception e) {
            logger.info("Error reading Proposal objects from " + input.getName() + ".xls", e.getMessage());
        }
        return list;
    }
}
