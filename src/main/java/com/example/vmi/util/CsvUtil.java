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

public class CsvUtil {
	public static String fromXlsx(File input){
        StringBuffer buffer = new StringBuffer();
        String output = null;
        try {
            XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(input));
            XSSFSheet sheet = wb.getSheetAt(0);
            
            for( Row row : sheet){
                for(Cell cell : row){
                    switch(cell.getCellTypeEnum()){
                        case STRING: 
                            buffer.append(cell.getRichStringCellValue().getString());
                            buffer.append(",");
                            break;
                        case NUMERIC:
                            buffer.append(cell.getNumericCellValue());
                            buffer.append(",");
                            break;
                        case BOOLEAN:
                            buffer.append(cell.getBooleanCellValue());
                            buffer.append(",");
                            break;
                        case BLANK:
                            buffer.append(" ,");
                            break;
                        default:
                    }
                }
                buffer.append("\n");
            }
            output = buffer.toString();

        } catch (Exception e) {
            System.err.println("Exception :" + e.getMessage());
        }
        return output;
	}
	public static String fromXls(File input){
		StringBuffer buffer = new StringBuffer();
        String output = null;
        try {
            HSSFWorkbook wb = new HSSFWorkbook(new FileInputStream(input));
            HSSFSheet sheet = wb.getSheetAt(0);
            
            for( Row row : sheet){
                for(Cell cell : row){
                    switch(cell.getCellTypeEnum()){
                        case STRING: 
                            buffer.append(cell.getRichStringCellValue().getString());
                            buffer.append(",");
                            break;
                        case NUMERIC:
                            buffer.append(cell.getNumericCellValue());
                            buffer.append(",");
                            break;
                        case BOOLEAN:
                            buffer.append(cell.getBooleanCellValue());
                            buffer.append(",");
                            break;
                        case BLANK:
                            buffer.append(" ,");
                            break;
                        default:
                    }
                }
                buffer.append("\n");
            }
            output = buffer.toString();

        } catch (Exception e) {
            System.err.println("Exception :" + e.getMessage());
        }
        return output;
		
	}
}
