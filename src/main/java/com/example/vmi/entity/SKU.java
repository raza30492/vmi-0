package com.example.vmi.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.opencsv.bean.CsvBindByName;


@Entity
@Table(
        name = "SKU",
        uniqueConstraints = @UniqueConstraint(columnNames = {"NAME", "FIT_ID"})
)
public class SKU implements Serializable{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false, unique = true)
    private Long id;
    
    @Column(name = "NAME", nullable = false)
    @CsvBindByName(column = "SKU")
    private String name;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "FIT_ID", nullable = false)
    private Fit fit;
    

    public SKU() {
    }

    public SKU(String sku, Fit fit) {
        this.name = sku;
        this.fit = fit;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Fit getFit() {
		return fit;
	}

	public void setFit(Fit fit) {
		this.fit = fit;
	}

	@Override
	public String toString() {
		return "SKU [id=" + id + ", name=" + name + ", fit=" + fit + "]";
	}

}
