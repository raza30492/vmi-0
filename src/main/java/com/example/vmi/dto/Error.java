package com.example.vmi.dto;

import java.util.List;

import com.example.vmi.entity.SKU;
import java.util.Set;

public class Error {

    private String code;
    private Set<String> fitsMissing;
    private List<SKUMissing> skusMissing;

    public Error() {
    }

    public Error(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Set<String> getFitsMissing() {
        return fitsMissing;
    }

    public void setFitsMissing(Set<String> fitsMissing) {
        this.fitsMissing = fitsMissing;
    }

    public List<SKUMissing> getSkusMissing() {
        return skusMissing;
    }

    public void setSkusMissing(List<SKUMissing> skusMissing) {
        this.skusMissing = skusMissing;
    }

    @Override
    public String toString() {
        return "Error [code=" + code + ", fitsMissing=" + fitsMissing + ", skusMissing=" + skusMissing + "]";
    }

}
