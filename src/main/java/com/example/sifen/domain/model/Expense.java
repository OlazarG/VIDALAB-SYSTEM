package com.example.sifen.domain.model;

import java.time.LocalDateTime;

public class Expense {
    private Long id;
    private LocalDateTime date;
    private Double amount;
    private String beneficiary;

    public Expense() {
    }

    public Expense(Long id, LocalDateTime date, Double amount, String beneficiary) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.beneficiary = beneficiary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getBeneficiary() {
        return beneficiary;
    }

    public void setBeneficiary(String beneficiary) {
        this.beneficiary = beneficiary;
    }
}
