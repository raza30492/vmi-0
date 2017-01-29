package com.example.vmi.service;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.vmi.dto.SKUMissing;
import com.example.vmi.dto.Error;
import com.example.vmi.dto.Proposal;
import com.example.vmi.dto.ProposalData;
import com.example.vmi.entity.Fit;
import com.example.vmi.entity.StockDetails;
import com.example.vmi.repository.FitRepository;
import com.example.vmi.repository.StockDetailsRepository;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class ProposalService {

    private final Logger logger = LoggerFactory.getLogger(ProposalService.class);

    @Autowired
    StockDetailsRepository stockDetailsRepository;

    @Autowired
    FitRepository fitRepository;
    
    private XSSFCellStyle style;

    public void calculateProposal(ProposalData data, Error error) {
        logger.info("calculateProposal()");
        logger.info(data.toString());
        //Check if current year proposed week data is empty
        if (stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek1(), data.getFitName()).isEmpty()) {
            logger.info("year-" + data.getYear() + ", week-" + data.getWeek1() + " Sales data not found");
            error.setCode("CURRENT_YEAR_WEEK1_DATA_NOT_FOUND");
            return;
        }
        if (data.getWeek2() != 0 && stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek2(), data.getFitName()).isEmpty()) {
            logger.info("year-" + data.getYear() + ", week-" + data.getWeek2() + " Sales data not found");
            error.setCode("CURRENT_YEAR_WEEK2_DATA_NOT_FOUND");
            return;
        }
        if (data.getWeek3() != 0 && stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek3(), data.getFitName()).isEmpty()) {
            logger.info("year-" + data.getYear() + ", week-" + data.getWeek3() + " Sales data not found");
            error.setCode("CURRENT_YEAR_WEEK3_DATA_NOT_FOUND");
            return;
        }
        if (data.getWeek4() != 0 && stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek4(), data.getFitName()).isEmpty()) {
            logger.info("year-" + data.getYear() + ", week-" + data.getWeek4() + " Sales data not found");
            error.setCode("CURRENT_YEAR_WEEK4_DATA_NOT_FOUND");
            return;
        }
        //Check if previous year week 51 data is empty
        if (stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear() - 1, 51, data.getFitName()).isEmpty()) {
            logger.info("year-" + (data.getYear() - 1) + ", week-51 Sales data not found");
            error.setCode("PREVIOUS_YEAR_DATA_NOT_FOUND");
            return;
        }

        List<StockDetails> week1 = stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek1(), data.getFitName());
        List<StockDetails> week2 = stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek2(), data.getFitName());
        List<StockDetails> week3 = stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek3(), data.getFitName());
        List<StockDetails> week4 = stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek4(), data.getFitName());
        List<SKUMissing> skusMissing = new ArrayList<>();
        List<Proposal> proposalList = new ArrayList<>();

        int sumTotalCumSales = 0;
        StockDetails tmpStockDetails = null, tmp;
        Proposal tmpProposal = null;
        int j = 0, cumWk1, cumWk2, cumWk3, cumWk4, bkOrder1, bkOrder2, bkOrder3, bkOrder4;

        for (StockDetails stk : week1) {
            cumWk1 = 0;
            cumWk2 = 0;
            cumWk3 = 0;
            cumWk4 = 0;
            bkOrder1 = 0;
            bkOrder2 = 0;
            bkOrder3 = 0;
            bkOrder4 = 0;
            tmpStockDetails = stockDetailsRepository.findByYearAndWeekAndSku((data.getYear() - 1), 51, stk.getSku());
            if (tmpStockDetails == null) {
                skusMissing.add(new SKUMissing(stk.getSku().getFit().getName(), stk.getSku().getName()));
                continue;
            }
            //Calculate average
            int numOfWeeks = 1;
            cumWk1 = stk.getCumUkSales();
            bkOrder2 = stk.getTwBackOrder();
            if (!week2.isEmpty()) {
                tmp = week2.get(j);
                cumWk2 = tmp.getCumUkSales();
                bkOrder2 = tmp.getTwBackOrder();
                numOfWeeks++;
            }
            if (!week3.isEmpty()) {
                tmp = week3.get(j);
                cumWk3 = tmp.getCumUkSales();
                bkOrder3 = tmp.getTwBackOrder();
                numOfWeeks++;
            }
            if (!week4.isEmpty()) {
                tmp = week4.get(j);
                cumWk4 = tmp.getCumUkSales();
                bkOrder4 = tmp.getTwBackOrder();
                numOfWeeks++;
            }

            tmpProposal = new Proposal();
            tmpProposal.setSkuId(stk.getSku().getId());
            tmpProposal.setSkuName(stk.getSku().getName());
            tmpProposal.setFitName(stk.getSku().getFit().getName());
            tmpProposal.setCumSaleWk1(cumWk1);
            tmpProposal.setCumSaleWk2(cumWk2);
            tmpProposal.setCumSaleWk3(cumWk3);
            tmpProposal.setCumSaleWk4(cumWk4);
            tmpProposal.setCumSale0((cumWk1 + cumWk2 + cumWk3 + cumWk4) / numOfWeeks);
            tmpProposal.setCumSale1(tmpStockDetails.getCumUkSales());
            tmpProposal.setTotalCumSale((stk.getCumUkSales() + tmpStockDetails.getCumUkSales()));
            sumTotalCumSales += tmpProposal.getTotalCumSale();
            tmpProposal.setBackOrder((bkOrder1 + bkOrder2 + bkOrder3 + bkOrder4) / numOfWeeks);
            tmpProposal.setOnStock(stk.getTwTotalStock());
            tmpProposal.setOnOrder(stk.getUkOnOrder());

            proposalList.add(tmpProposal);
            j++;
        }

        if (skusMissing.size() > 0) {
            logger.info(skusMissing.size() + " previous year skus missing");
            error.setCode("HISTORY_SKUS_MISSING");
            error.setSkusMissing(skusMissing);
            return;
        }

        for (Proposal proposal : proposalList) {
            proposal.setCumSaleRatio(((double) proposal.getTotalCumSale() / (double) sumTotalCumSales));
            proposal.setSkuSaleRatio((proposal.getCumSaleRatio() * data.getSalesForcast()));
            proposal.setSkuSaleRatioFor12Weeks((int) (proposal.getSkuSaleRatio() * 12));
            proposal.setBackOrderPlus12WeekSale((proposal.getBackOrder() + proposal.getSkuSaleRatioFor12Weeks()));
            proposal.setSeasonIntakeProposal(getMultipleOfSix(proposal.getBackOrderPlus12WeekSale()));
            proposal.setCalValue1((int) (proposal.getCumSaleRatio() * data.getCumSalesForcast()));
            proposal.setCalValue2((proposal.getOnStock() + proposal.getOnOrder() - proposal.getCalValue1() - proposal.getBackOrder()));
            proposal.setCalValue3((proposal.getBackOrderPlus12WeekSale() - proposal.getCalValue2()));
            proposal.setCalValue4((proposal.getCalValue3() > 0) ? getMultipleOfSix(proposal.getCalValue3()) : 0);

        }

        //Write data to Excel Sheet
        XSSFWorkbook workbookMain = new XSSFWorkbook();
        XSSFSheet sheetMain = workbookMain.createSheet(data.getFitName());
        style = workbookMain.createCellStyle();
        writeToSheetMain(proposalList, sheetMain, data.getYear(), data.getWeek1(), data.getWeek2(), data.getWeek3(), data.getWeek4());

        XSSFWorkbook workbookSummary = new XSSFWorkbook();
        XSSFSheet sheetSummary = workbookSummary.createSheet(data.getFitName());
        writeToSheetSummary(proposalList, sheetSummary, data.getYear(), data.getWeek1());

        for (int i = 0; i < 18; i++) {
            sheetMain.autoSizeColumn(i);
        }
        for (int i = 0; i < 4; i++) {
            sheetSummary.autoSizeColumn(i);
        }
        //////////Creating Directory Structure and then writing to Excel file ////////////
        Fit fit = fitRepository.findByName(data.getFitName());
        Path buyerDir = Paths.get("data", "proposals", String.valueOf("buyer" + fit.getBuyer().getId()));
        Path fitDir = buyerDir.resolve("fit" + fit.getId());
        Path proposalDir = fitDir.resolve(String.valueOf(data.getYear()));
        Path mainDir = proposalDir.resolve("main");
        Path summaryDir = proposalDir.resolve("summary");

        String fileMain = "Proposal_Main_Fit" + fit.getId() + "_Week" + data.getWeek1() + "_Year" + data.getYear() + ".xlsx";
        String fileSummary = "Proposal_Summary_Fit" + fit.getId() + "_Week" + data.getWeek1() + "_Year" + data.getYear() + ".xlsx";
        Path pathMain = mainDir.resolve(fileMain);
        Path pathSummary = summaryDir.resolve(fileSummary);
        try {
            if (!Files.exists(buyerDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(buyerDir);
                logger.info("created " + buyerDir.toString() + " directory");
            }
            if (!Files.exists(fitDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(fitDir);
                logger.info("created " + fitDir.toString() + " directory");
            }
            if (!Files.exists(proposalDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(proposalDir);
                logger.info("created " + proposalDir.toString() + " directory");
            }
            if (!Files.exists(mainDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(mainDir);
                logger.info("creating " + mainDir.toString() + " directory");
            }
            if (!Files.exists(summaryDir, new LinkOption[]{LinkOption.NOFOLLOW_LINKS})) {
                Files.createDirectory(summaryDir);
                logger.info("creating " + summaryDir.toString() + " directory");
            }
            //Delete if Files Exist
            Files.deleteIfExists(pathMain);
            Files.deleteIfExists(pathSummary);

            OutputStream os1 = new FileOutputStream(pathMain.toFile());
            workbookMain.write(os1);
            os1.close();
            workbookMain.close();

            OutputStream os2 = new FileOutputStream(pathSummary.toFile());
            workbookSummary.write(os2);
            os2.close();
            workbookSummary.close();

        } catch (Exception e) {
            logger.error("Some Error occured writing excel file", e.getMessage());
            e.printStackTrace();
        }
    }

    private void writeToSheetMain(List<Proposal> proposalList, XSSFSheet sheet, int year, int week1, int week2, int week3, int week4) {
        logger.info("Writing Complete Proposal for year-" + year + ",week-" + week1 + " to Sheet");
        style.setWrapText(true);
        
        XSSFRow row = null;
        row = sheet.createRow(0);
        row.setRowStyle(style);
        //row.setHeightInPoints((2 * sheet.getDefaultRowHeightInPoints()));
        setLabelMain(row, year, week1, week2, week3, week4);

        int rowId = 0;
        XSSFCell cell = null;
        for (Proposal proposal : proposalList) {
            int i = 0;
            rowId++;
            row = sheet.createRow(rowId);           
            
            cell = row.createCell(i++);
            cell.setCellValue(rowId);

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getSkuName());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getFitName());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCumSale1());

            if (week4 != 0) {
                cell = row.createCell(i++);
                cell.setCellValue(proposal.getCumSaleWk4());
            }

            if (week3 != 0) {
                cell = row.createCell(i++);
                cell.setCellValue(proposal.getCumSaleWk3());
            }

            if (week2 != 0) {
                cell = row.createCell(i++);
                cell.setCellValue(proposal.getCumSaleWk2());
            }

            if (week4 != 0 || week3 != 0 || week2 != 0) {
                cell = row.createCell(i++);
                cell.setCellValue(proposal.getCumSaleWk1());
            }

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCumSale0());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getTotalCumSale());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCumSaleRatio());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getSkuSaleRatio());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getSkuSaleRatioFor12Weeks());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getBackOrder());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getBackOrderPlus12WeekSale());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getSeasonIntakeProposal());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getOnStock());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getOnOrder());

            cell = row.createCell(i++);
            cell.setCellValue("");

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCalValue1());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCalValue2());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCalValue3());

            cell = row.createCell(i++);
            cell.setCellValue(proposal.getCalValue4());
        }

    }

    private void setLabelMain(XSSFRow row, int year, int week1, int week2, int week3, int week4) {
        XSSFCell cell;
        int i = 0;
        
        
        cell = row.createCell(i++);
        cell.setCellValue("Sl. No.");

        cell = row.createCell(i++);
        cell.setCellValue("SKU");

        cell = row.createCell(i++);
        cell.setCellValue("FIT");

        cell = row.createCell(i++);
        cell.setCellValue("CUM SALE\n(" + (year - 1) + ")");
        cell.setCellStyle(style);

        if (week4 != 0) {
            cell = row.createCell(i++);
            cell.setCellValue("CUM SALE\n(" + year + ") WK" + week4);
            cell.setCellStyle(style);
        }

        if (week3 != 0) {
            cell = row.createCell(i++);
            cell.setCellValue("CUM SALE\n(" + year + ") WK" + week3);
            cell.setCellStyle(style);
        }

        if (week2 != 0) {
            cell = row.createCell(i++);
            cell.setCellValue("CUM SALE\n(" + year + ") WK" + week2);
            cell.setCellStyle(style);
        }

        if (week4 != 0 || week3 != 0 || week2 != 0) {
            cell = row.createCell(i++);
            cell.setCellValue("CUM SALE(" + year + ") WK" + week1);
            cell.setCellStyle(style);
        }

        cell = row.createCell(i++);
        cell.setCellValue("CUM SALE AVG");

        cell = row.createCell(i++);
        cell.setCellValue("TOTAL CUM SALE");

        cell = row.createCell(i++);
        cell.setCellValue("CUM SALE RATIO");

        cell = row.createCell(i++);
        cell.setCellValue("SKU SALE RATIO");

        cell = row.createCell(i++);
        cell.setCellValue("For 12 Weeks");

        cell = row.createCell(i++);
        cell.setCellValue("BACK ORDER AVG");

        cell = row.createCell(i++);
        cell.setCellValue("BACK ORDER + 12 WKS SALES");

        cell = row.createCell(i++);
        cell.setCellValue("SEASON'S INTAKE PROPOSAL\n(MULTIPLE OF 6)");

        cell = row.createCell(i++);
        cell.setCellValue("ON STOCK WK" + week1);

        cell = row.createCell(i++);
        cell.setCellValue("ON ORDER WK" + week1);

        cell = row.createCell(i++);
        cell.setCellValue("");

        cell = row.createCell(i++);
        cell.setCellValue("SALES WK" + (week1 + 1) + "-" + (week1 + 13));

        cell = row.createCell(i++);
        cell.setCellValue("=P+Q-S-M");

        cell = row.createCell(i++);
        cell.setCellValue("+/- VAR vs IDEAL STK HOLDING WK" + week1);

        cell = row.createCell(i++);
        cell.setCellValue("INTAKE PROPOSAL (MULTIPLE OF 6)");

    }

    private void writeToSheetSummary(List<Proposal> proposalList, XSSFSheet sheet, int year, int week) {
        logger.info("Writing Summary Proposal for year-" + year + ",week-" + week + " to Sheet");
        setLabelSummary(sheet.createRow(0), year, week);

        int rowId = 0;
        XSSFRow row = null;
        XSSFCell cell = null;
        for (Proposal proposal : proposalList) {
            rowId++;
            row = sheet.createRow(rowId);

            cell = row.createCell(0);
            cell.setCellValue(rowId);

            cell = row.createCell(1);
            cell.setCellValue(proposal.getSkuName());

            cell = row.createCell(2);
            cell.setCellValue(proposal.getFitName());

            cell = row.createCell(3);
            cell.setCellValue(proposal.getCalValue4());
        }

    }

    private void setLabelSummary(XSSFRow row, int year, int week) {
        XSSFCell cell;

        cell = row.createCell(0);
        cell.setCellValue("Sl. No.");

        cell = row.createCell(1);
        cell.setCellValue("SKU");

        cell = row.createCell(2);
        cell.setCellValue("FIT");

        cell = row.createCell(3);
        cell.setCellValue("INTAKE PROPOSAL (MULTIPLE OF 6)");

    }

    private int getMultipleOfSix(int number) {
        int remainder = (number % 6);
        int result = (remainder >= 3 ? (number + (6 - remainder)) : (number - remainder));
        return result;
    }

}
