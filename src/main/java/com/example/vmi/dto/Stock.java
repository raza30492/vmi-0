package com.example.vmi.dto;

import com.opencsv.bean.CsvBindByName;

public class Stock {

    private int year;
    
    private int week;
    
    @CsvBindByName(column = "SKU")
    private String skuName;
    
    @CsvBindByName(column = "FIT")
    private String fit;
    
    @CsvBindByName(column = "TW_WH_STK_UNIT")
    private double twWarehouseStock;
    
    @CsvBindByName(column = "TW_UK_RETAIL_STK_UNIT")
    private double twUkRetailStock;
    
    @CsvBindByName(column = "TW_TOTAL_STK_UNIT")
    private double twTotalStock;
    
    @CsvBindByName(column = "TW_BACK_ORDERS")
    private double twBackOrders;
    
    @CsvBindByName(column = "TW_SALES_UNIT")
    private double twSales;
    
    @CsvBindByName(column = "LW_SALES_UNIT")
    private double lwSales;
    
    @CsvBindByName(column = "TW_GOODS_RECEIVED")
    private double twGoodsReceived;
    
    @CsvBindByName(column = "CUM_UK_SALES_UNIT")
    private double cumUkSales;
    
    @CsvBindByName(column = "UK_ON_ORDER_UNIT")
    private double ukOnOrder;
    
    public Stock(){}
    
	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public int getWeek() {
		return week;
	}

	public void setWeek(int week) {
		this.week = week;
	}

	public String getSkuName() {
		return skuName;
	}

	public void setSkuName(String skuName) {
		this.skuName = skuName;
	}

	public String getFit() {
		return fit;
	}

	public void setFit(String fit) {
		this.fit = fit;
	}

	public double getTwWarehouseStock() {
		return twWarehouseStock;
	}

	public void setTwWarehouseStock(double twWarehouseStock) {
		this.twWarehouseStock = twWarehouseStock;
	}

	public double getTwUkRetailStock() {
		return twUkRetailStock;
	}

	public void setTwUkRetailStock(double twUkRetailStock) {
		this.twUkRetailStock = twUkRetailStock;
	}

	public double getTwTotalStock() {
		return twTotalStock;
	}

	public void setTwTotalStock(double twTotalStock) {
		this.twTotalStock = twTotalStock;
	}

	public double getTwBackOrders() {
		return twBackOrders;
	}

	public void setTwBackOrders(double twBackOrders) {
		this.twBackOrders = twBackOrders;
	}

	public double getTwSales() {
		return twSales;
	}

	public void setTwSales(double twSales) {
		this.twSales = twSales;
	}

	public double getLwSales() {
		return lwSales;
	}

	public void setLwSales(double lwSales) {
		this.lwSales = lwSales;
	}

	public double getTwGoodsReceived() {
		return twGoodsReceived;
	}

	public void setTwGoodsReceived(double twGoodsReceived) {
		this.twGoodsReceived = twGoodsReceived;
	}

	public double getCumUkSales() {
		return cumUkSales;
	}

	public void setCumUkSales(double cumUkSales) {
		this.cumUkSales = cumUkSales;
	}

	public double getUkOnOrder() {
		return ukOnOrder;
	}

	public void setUkOnOrder(double ukOnOrder) {
		this.ukOnOrder = ukOnOrder;
	}

	@Override
	public String toString() {
		return "Stock [year=" + year + ", week=" + week + ", sku=" + skuName + ", fit=" + fit + ", twWarehouseStock="
				+ twWarehouseStock + ", twUkRetailStock=" + twUkRetailStock + ", twTotalStock=" + twTotalStock
				+ ", twBackOrders=" + twBackOrders + ", twSales=" + twSales + ", lwSales=" + lwSales
				+ ", twGoodsReceived=" + twGoodsReceived + ", cumUkSales=" + cumUkSales + ", ukOnOrder=" + ukOnOrder
				+ "]";
	}
    
    
}
