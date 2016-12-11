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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional(readOnly = true)
public class ProposalService {
    private final Logger logger = LoggerFactory.getLogger(BuyerService.class);
    
    @Autowired StockDetailsRepository stockDetailsRepository;

    @Autowired FitRepository fitRepository;

    public void calculateProposal(ProposalData data, Error error) {
        //Check if current year proposed week data is empty
        if (stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek(), data.getFitName()).isEmpty()) {
            logger.info("year-" + data.getYear() + ", week-" + data.getWeek() + " Sales data not found");
            error.setCode("CURRENT_YEAR_DATA_NOT_FOUND");
            return;
        }
        //Check if previous year week 51 data is empty
        if (stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear() - 1, 51, data.getFitName()).isEmpty()) {
            logger.info("year-" + (data.getYear()-1) + ", week-51 Sales data not found");
            error.setCode("PREVIOUS_YEAR_DATA_NOT_FOUND");
            return;
        }

        List<StockDetails> prevStocks = stockDetailsRepository.findByYearAndWeekAndSkuFitName(data.getYear(), data.getWeek(), data.getFitName());
        List<SKUMissing> skusMissing = new ArrayList<>();
        List<Proposal> proposalList = new ArrayList<>();
        int sumTotalCumSales = 0;
        StockDetails tmpStockDetails = null;
        Proposal tmpProposal = null;

        for (StockDetails stk : prevStocks) {
            tmpStockDetails = stockDetailsRepository.findByYearAndWeekAndSku((data.getYear() - 1), 51, stk.getSku());
            if (tmpStockDetails == null) {
                skusMissing.add(new SKUMissing(stk.getSku().getFit().getName(), stk.getSku().getName()));
            }

            tmpProposal = new Proposal();
            tmpProposal.setSkuId(stk.getSku().getId());
            tmpProposal.setSkuName(stk.getSku().getName());
            tmpProposal.setFitName(stk.getSku().getFit().getName());
            tmpProposal.setCumSale0(stk.getCumUkSales());
            tmpProposal.setCumSale1(tmpStockDetails.getCumUkSales());
            tmpProposal.setTotalCumSale((stk.getCumUkSales() + tmpStockDetails.getCumUkSales()));
            sumTotalCumSales += tmpProposal.getTotalCumSale();
            tmpProposal.setBackOrder(stk.getTwBackOrder());
            tmpProposal.setOnStock(stk.getTwTotalStock());
            tmpProposal.setOnOrder(stk.getUkOnOrder());

            proposalList.add(tmpProposal);
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
        writeToSheetMain(proposalList, sheetMain, data.getYear(), data.getWeek());

        XSSFWorkbook workbookSummary = new XSSFWorkbook();
        XSSFSheet sheetSummary = workbookSummary.createSheet(data.getFitName());
        writeToSheetSummary(proposalList, sheetSummary, data.getYear(), data.getWeek());

        //////////Creating Directory Structure and then writing to Excel file ////////////
        Fit fit = fitRepository.findByName(data.getFitName());
        Path buyerDir = Paths.get("data", "proposals", String.valueOf("buyer" + fit.getBuyer().getId()));
        Path fitDir = buyerDir.resolve("fit" + fit.getId());
        Path proposalDir = fitDir.resolve(String.valueOf(data.getYear()));
        Path mainDir = proposalDir.resolve("main");
        Path summaryDir = proposalDir.resolve("summary");

        String fileMain = "Proposal_Main_Fit" + fit.getId() + "_Week" + data.getWeek() + "_Year" + data.getYear() + ".xlsx";
        String fileSummary = "Proposal_Summary_Fit" + fit.getId() + "_Week" + data.getWeek() + "_Year" + data.getYear() + ".xlsx";
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

    private void writeToSheetMain(List<Proposal> proposalList, XSSFSheet sheet, int year, int week) {
        logger.info("Writing Complete Proposal for year-" + year + ",week-" + week + " to Sheet");
        setLabelMain(sheet.createRow(0), year, week);

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
            cell.setCellValue(proposal.getCumSale1());

            cell = row.createCell(4);
            cell.setCellValue(proposal.getCumSale0());

            cell = row.createCell(5);
            cell.setCellValue(proposal.getTotalCumSale());

            cell = row.createCell(6);
            cell.setCellValue(proposal.getCumSaleRatio());

            cell = row.createCell(7);
            cell.setCellValue(proposal.getSkuSaleRatio());

            cell = row.createCell(8);
            cell.setCellValue(proposal.getSkuSaleRatioFor12Weeks());

            cell = row.createCell(9);
            cell.setCellValue(proposal.getBackOrder());

            cell = row.createCell(10);
            cell.setCellValue(proposal.getBackOrderPlus12WeekSale());

            cell = row.createCell(11);
            cell.setCellValue(proposal.getSeasonIntakeProposal());

            cell = row.createCell(12);
            cell.setCellValue(proposal.getOnStock());

            cell = row.createCell(13);
            cell.setCellValue(proposal.getOnOrder());

            cell = row.createCell(14);
            cell.setCellValue(proposal.getCalValue1());

            cell = row.createCell(15);
            cell.setCellValue(proposal.getCalValue2());

            cell = row.createCell(16);
            cell.setCellValue(proposal.getCalValue3());

            cell = row.createCell(17);
            cell.setCellValue(proposal.getCalValue4());
        }

    }

    private void setLabelMain(XSSFRow row, int year, int week) {
        XSSFCell cell;

        cell = row.createCell(0);
        cell.setCellValue("Sl. No.");

        cell = row.createCell(1);
        cell.setCellValue("SKU");

        cell = row.createCell(2);
        cell.setCellValue("FIT");

        cell = row.createCell(3);
        cell.setCellValue("CUM SALE(" + year + ")");

        cell = row.createCell(4);
        cell.setCellValue("CUM SALE WK" + week);

        cell = row.createCell(5);
        cell.setCellValue("TOTAL CUM SALE");

        cell = row.createCell(6);
        cell.setCellValue("CUM SALE RATIO");

        cell = row.createCell(7);
        cell.setCellValue("SKU SALE RATIO(WK" + (week + 13) + ")");

        cell = row.createCell(8);
        cell.setCellValue("For 12 Weeks");

        cell = row.createCell(9);
        cell.setCellValue("BACK ORDER WK" + week);

        cell = row.createCell(10);
        cell.setCellValue("BACK ORDER + 12 WKS SALES");

        cell = row.createCell(11);
        cell.setCellValue("SEASON'S INTAKE PROPOSAL(MULTIPLE OF 6)");

        cell = row.createCell(12);
        cell.setCellValue("ON STOCK WK" + week);

        cell = row.createCell(13);
        cell.setCellValue("ON ORDER WK" + week);

        cell = row.createCell(14);
        cell.setCellValue("SALES WK" + (week + 1) + "-" + (week + 13));

        cell = row.createCell(15);
        cell.setCellValue("=M+N-O-J");

        cell = row.createCell(16);
        cell.setCellValue("+/- VAR vs IDEAL STK HOLDING WK" + week);

        cell = row.createCell(17);
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
