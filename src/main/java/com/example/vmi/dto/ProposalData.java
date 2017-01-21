package com.example.vmi.dto;

public class ProposalData {

    private String fitName;
    private int year;
    private int week1;
    private int week2;
    private int week3;
    private int week4;
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

    public int getWeek1() {
        return week1;
    }

    public void setWeek1(int week1) {
        this.week1 = week1;
    }

    public int getWeek2() {
        return week2;
    }

    public void setWeek2(int week2) {
        this.week2 = week2;
    }

    public int getWeek3() {
        return week3;
    }

    public void setWeek3(int week3) {
        this.week3 = week3;
    }

    public int getWeek4() {
        return week4;
    }

    public void setWeek4(int week4) {
        this.week4 = week4;
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

    @Override
    public String toString() {
        return "ProposalData{" + "fitName=" + fitName + ", year=" + year + ", week1=" + week1 + ", week2=" + week2 + ", week3=" + week3 + ", week4=" + week4 + ", salesForcast=" + salesForcast + ", cumSalesForcast=" + cumSalesForcast + '}';
    }
    
}
