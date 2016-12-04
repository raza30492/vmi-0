package com.example.vmi.dto;

public class ProposalData {
	private String fitName;
	private int year;
	private int week;
	private int salesForcast;
	private int cumSalesForcast;
	public String getFitName() {
		return fitName;
	}
	public void setFitName(String fitName) {
		this.fitName = fitName;
	}
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
	public int getSalesForcast() {
		return salesForcast;
	}
	public void setSalesForcast(int salesForcast) {
		this.salesForcast = salesForcast;
	}
	public int getCumSalesForcast() {
		return cumSalesForcast;
	}
	public void setCumSalesForcast(int cumSalesForcast) {
		this.cumSalesForcast = cumSalesForcast;
	}
	
}
