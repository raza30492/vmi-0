package com.example.vmi.dto;

import java.util.List;

import com.example.vmi.entity.SKU;

public class StockMissing {
	private String code;
	private List<String> fitsMissing;
	private List<SKU> skusMissing;
	public StockMissing() {
		super();
	}
	public StockMissing(String code) {
		super();
		this.code = code;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public List<String> getFitsMissing() {
		return fitsMissing;
	}
	public void setFitsMissing(List<String> fitsMissing) {
		this.fitsMissing = fitsMissing;
	}
	public List<SKU> getSkusMissing() {
		return skusMissing;
	}
	public void setSkusMissing(List<SKU> skusMissing) {
		this.skusMissing = skusMissing;
	}
}
