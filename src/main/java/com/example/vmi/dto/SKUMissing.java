package com.example.vmi.dto;

public class SKUMissing {
	private String fit;
	private String sku;
	
	public SKUMissing(String fit, String sku) {
		this.fit = fit;
		this.sku = sku;
	}
	public String getFit() {
		return fit;
	}
	public void setFit(String fit) {
		this.fit = fit;
	}
	public String getSku() {
		return sku;
	}
	public void setSku(String sku) {
		this.sku = sku;
	}
}
