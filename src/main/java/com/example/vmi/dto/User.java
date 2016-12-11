package com.example.vmi.dto;

public class User {

    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String role;
    private String buyer;
    private String oldPassword;
    private String newPassword;

    public User() {
    }

    public User(Long id, String name, String email, String mobile, String role) {
        super();
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.role = role;
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

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBuyer() {
        return buyer;
    }

    public void setBuyer(String buyer) {
        this.buyer = buyer;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", name=" + name + ", email=" + email + ", mobile=" + mobile + ", role=" + role
                + ", buyer=" + buyer + "]";
    }

}
