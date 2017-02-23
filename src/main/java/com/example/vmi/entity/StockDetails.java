package com.example.vmi.entity;

import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Entity
@Table(
        name = "STOCK_DETAILS",
        uniqueConstraints = @UniqueConstraint(columnNames = {"SKU_ID", "YEAR", "WEEK"})
)
public class StockDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "SKU_ID")
    private SKU sku;

    @Column(name = "YEAR", nullable = false)
    private int year;

    @Column(name = "WEEK", nullable = false)
    private int week;

    @Column(name = "TW_WAREHOUSE_STOCK")
    private int twWarehouseStock;

    @Column(name = "TW_UK_RETAIL_STOCK")
    private int twUkRetailStock;

    @Column(name = "TW_TOTAL_STOCK")
    private int twTotalStock;

    @Column(name = "TW_BACK_ORDER")
    private int twBackOrder;

    @Column(name = "TW_SALES")
    private int twSales;

    @Column(name = "LW_SALES")
    private int lwSales;

    @Column(name = "TW_GOODS_RECEIVED")
    private int twGoodsReceived;

    @Column(name = "CUM_UK_SALES")
    private int cumUkSales;

    @Column(name = "UK_ON_ORDER")
    private int ukOnOrder;

    public StockDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SKU getSku() {
        return sku;
    }

    public void setSku(SKU sku) {
        this.sku = sku;
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

    public int getTwWarehouseStock() {
        return twWarehouseStock;
    }

    public void setTwWarehouseStock(int twWarehouseStock) {
        this.twWarehouseStock = twWarehouseStock;
    }

    public int getTwUkRetailStock() {
        return twUkRetailStock;
    }

    public void setTwUkRetailStock(int twUkRetailStock) {
        this.twUkRetailStock = twUkRetailStock;
    }

    public int getTwTotalStock() {
        return twTotalStock;
    }

    public void setTwTotalStock(int twTotalStock) {
        this.twTotalStock = twTotalStock;
    }

    public int getTwBackOrder() {
        return twBackOrder;
    }

    public void setTwBackOrder(int twBackOrder) {
        this.twBackOrder = twBackOrder;
    }

    public int getTwSales() {
        return twSales;
    }

    public void setTwSales(int twSales) {
        this.twSales = twSales;
    }

    public int getLwSales() {
        return lwSales;
    }

    public void setLwSales(int lwSales) {
        this.lwSales = lwSales;
    }

    public int getTwGoodsReceived() {
        return twGoodsReceived;
    }

    public void setTwGoodsReceived(int twGoodsReceived) {
        this.twGoodsReceived = twGoodsReceived;
    }

    public int getCumUkSales() {
        return cumUkSales;
    }

    public void setCumUkSales(int cumUkSales) {
        this.cumUkSales = cumUkSales;
    }

    public int getUkOnOrder() {
        return ukOnOrder;
    }

    public void setUkOnOrder(int ukOnOrder) {
        this.ukOnOrder = ukOnOrder;
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 23 * hash + Objects.hashCode(this.id);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final StockDetails other = (StockDetails) obj;
        if (!Objects.equals(this.sku, other.sku)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "StockDetails [id=" + id + ", sku=" + sku + ", year=" + year + ", week=" + week + ", twWarehouseStock="
                + twWarehouseStock + ", twUkRetailStock=" + twUkRetailStock + ", twTotalStock=" + twTotalStock
                + ", twBackOrder=" + twBackOrder + ", twSales=" + twSales + ", lwSales=" + lwSales
                + ", twGoodsReceived=" + twGoodsReceived + ", cumUkSales=" + cumUkSales + ", ukOnOrder=" + ukOnOrder
                + "]";
    }

}
