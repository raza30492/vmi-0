package com.example.vmi.dto;

public class Proposal {
	private Long skuId;
	private String fitName;
	private String skuName;
	private int cumSale0; 	//Cummulative sale of current year
	private int cumSale1;	//Cummulative sale of (current year - 1)
	private int totalCumSale;
	private double cumSaleRatio;
	private double skuSaleRatio;
	private int skuSaleRatioFor12Weeks;
	private int backOrder;
	private int backOrderPlus12WeekSale; //skuSaleRatioFor12Weeks+backOrder
	private int seasonIntakeProposal; // round backOrderPlus12WeekSale to multiple of 6
	private int onStock;
	private int onOrder;
	private int calValue1; // Sales WK3-15
	private int calValue2;	//(onStock + onOrder - calValue1 - backOrder)
	private int calValue3;	//(skuSaleRatioFor12Weeks - calValue2)
	private int calValue4;  // 0: if calValue3 < 0 , multiple of 6 if calValue3 > 0
	public Long getSkuId() {
		return skuId;
	}
	public void setSkuId(Long skuId) {
		this.skuId = skuId;
	}
	public String getFitName() {
		return fitName;
	}
	public void setFitName(String fitName) {
		this.fitName = fitName;
	}
	public String getSkuName() {
		return skuName;
	}
	public void setSkuName(String skuName) {
		this.skuName = skuName;
	}
	public int getCumSale0() {
		return cumSale0;
	}
	public void setCumSale0(int cumSale0) {
		this.cumSale0 = cumSale0;
	}
	public int getCumSale1() {
		return cumSale1;
	}
	public void setCumSale1(int cumSale1) {
		this.cumSale1 = cumSale1;
	}
	public int getTotalCumSale() {
		return totalCumSale;
	}
	public void setTotalCumSale(int totalCumSale) {
		this.totalCumSale = totalCumSale;
	}
	public double getCumSaleRatio() {
		return cumSaleRatio;
	}
	public void setCumSaleRatio(double cumSaleRatio) {
		this.cumSaleRatio = cumSaleRatio;
	}
	public double getSkuSaleRatio() {
		return skuSaleRatio;
	}
	public void setSkuSaleRatio(double skuSaleRatio) {
		this.skuSaleRatio = skuSaleRatio;
	}
	public int getSkuSaleRatioFor12Weeks() {
		return skuSaleRatioFor12Weeks;
	}
	public void setSkuSaleRatioFor12Weeks(int skuSaleRatioFor12Weeks) {
		this.skuSaleRatioFor12Weeks = skuSaleRatioFor12Weeks;
	}
	public int getBackOrder() {
		return backOrder;
	}
	public void setBackOrder(int backOrder) {
		this.backOrder = backOrder;
	}
	public int getBackOrderPlus12WeekSale() {
		return backOrderPlus12WeekSale;
	}
	public void setBackOrderPlus12WeekSale(int backOrderPlus12WeekSale) {
		this.backOrderPlus12WeekSale = backOrderPlus12WeekSale;
	}
	public int getSeasonIntakeProposal() {
		return seasonIntakeProposal;
	}
	public void setSeasonIntakeProposal(int seasonIntakeProposal) {
		this.seasonIntakeProposal = seasonIntakeProposal;
	}
	public int getOnStock() {
		return onStock;
	}
	public void setOnStock(int onStock) {
		this.onStock = onStock;
	}
	public int getOnOrder() {
		return onOrder;
	}
	public void setOnOrder(int onOrder) {
		this.onOrder = onOrder;
	}
	public int getCalValue1() {
		return calValue1;
	}
	public void setCalValue1(int calValue1) {
		this.calValue1 = calValue1;
	}
	public int getCalValue2() {
		return calValue2;
	}
	public void setCalValue2(int calValue2) {
		this.calValue2 = calValue2;
	}
	public int getCalValue3() {
		return calValue3;
	}
	public void setCalValue3(int calValue3) {
		this.calValue3 = calValue3;
	}
	public int getCalValue4() {
		return calValue4;
	}
	public void setCalValue4(int calValue4) {
		this.calValue4 = calValue4;
	}
	@Override
	public String toString() {
		return "Proposal [skuId=" + skuId + ", fitName=" + fitName + ", skuName=" + skuName + ", cumSale0=" + cumSale0
				+ ", cumSale1=" + cumSale1 + ", totalCumSale=" + totalCumSale + ", cumSaleRatio=" + cumSaleRatio
				+ ", skuSaleRatio=" + skuSaleRatio + ", skuSaleRatioFor12Weeks=" + skuSaleRatioFor12Weeks
				+ ", backOrder=" + backOrder + ", backOrderPlus12WeekSale=" + backOrderPlus12WeekSale
				+ ", seasonIntakeProposal=" + seasonIntakeProposal + ", onStock=" + onStock + ", onOrder=" + onOrder
				+ ", calValue1=" + calValue1 + ", calValue2=" + calValue2 + ", calValue3=" + calValue3 + ", calValue4="
				+ calValue4 + "]";
	}
	
}
