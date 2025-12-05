package com.example.sifen.domain.model;

public class InvoiceItem {
    private Long id;
    private String code;
    private String description;
    private Integer quantity;
    private Double unitPrice;
    private String vatRate;
    private Double subtotal;

    public InvoiceItem() {
    }

    public InvoiceItem(Long id, String code, String description, Integer quantity, Double unitPrice, String vatRate,
            Double subtotal) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.vatRate = vatRate;
        this.subtotal = subtotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getVatRate() {
        return vatRate;
    }

    public void setVatRate(String vatRate) {
        this.vatRate = vatRate;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}
