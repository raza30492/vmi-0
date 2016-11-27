package com.example.vmi.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "EMPLOYEE")
public class Employee implements Serializable {
	    @Id
	    @Column(name = "EMP_ID", nullable = false, unique = true)
	    private Long id;
	    
	    @Column(name = "NAME", nullable = false)
	    private String name;
	    
	    @Column(name = "EMAIL", nullable = true)
	    private String email;
	    
	    @Column(name = "PASSWORD", nullable = false)
	    private String password;
	    
	    @Column(name = "MOBILE", nullable = true)
	    private String mobile;

	    public Employee() {
	    }

	    public Employee(String name, String email, String password) {
	        this.name = name;
	        this.email = email;
	        this.password = password;
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

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}

		public String getPassword() {
			return password;
		}

		public void setPassword(String password) {
			this.password = password;
		}

		public String getMobile() {
			return mobile;
		}

		public void setMobile(String mobile) {
			this.mobile = mobile;
		}
	    
}
