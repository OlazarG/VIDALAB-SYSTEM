package com.example.sifen.domain.model;

public class Client {
    private Long id;
    private String ruc;
    private String businessName;
    private String address;
    private String email;

    public Client() {
    }

    public Client(Long id, String ruc, String businessName, String address, String email) {
        this.id = id;
        this.ruc = ruc;
        this.businessName = businessName;
        this.address = address;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
