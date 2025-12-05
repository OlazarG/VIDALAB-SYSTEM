package com.example.sifen.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Invoice {
    private Long id;
    private String cdc;
    private String stampNumber;
    private LocalDateTime issueDate;
    private String taxpayerType;
    private String clientRuc;
    private String clientName;
    private String clientEmail;
    private String condition;
    private Integer creditDays;
    private String paymentMethod;
    private Double totalVat5;
    private Double totalVat10;
    private Double totalExempt;
    private Double totalAmount;
    private String status;
    private List<InvoiceItem> items = new ArrayList<>();

    public Invoice() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCdc() {
        return cdc;
    }

    public void setCdc(String cdc) {
        this.cdc = cdc;
    }

    public String getStampNumber() {
        return stampNumber;
    }

    public void setStampNumber(String stampNumber) {
        this.stampNumber = stampNumber;
    }

    public LocalDateTime getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

    public String getTaxpayerType() {
        return taxpayerType;
    }

    public void setTaxpayerType(String taxpayerType) {
        this.taxpayerType = taxpayerType;
    }

    public String getClientRuc() {
        return clientRuc;
    }

    public void setClientRuc(String clientRuc) {
        this.clientRuc = clientRuc;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public Integer getCreditDays() {
        return creditDays;
    }

    public void setCreditDays(Integer creditDays) {
        this.creditDays = creditDays;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getTotalVat5() {
        return totalVat5;
    }

    public void setTotalVat5(Double totalVat5) {
        this.totalVat5 = totalVat5;
    }

    public Double getTotalVat10() {
        return totalVat10;
    }

    public void setTotalVat10(Double totalVat10) {
        this.totalVat10 = totalVat10;
    }

    public Double getTotalExempt() {
        return totalExempt;
    }

    public void setTotalExempt(Double totalExempt) {
        this.totalExempt = totalExempt;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items;
    }

    public void addItem(InvoiceItem item) {
        this.items.add(item);
    }
}
