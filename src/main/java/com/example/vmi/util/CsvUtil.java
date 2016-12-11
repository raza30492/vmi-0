package com.example.vmi.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;

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
}
