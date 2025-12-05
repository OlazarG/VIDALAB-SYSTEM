package com.example.sifen.domain.model;

import java.time.LocalDateTime;

public class Income {
    private Long id;
    private LocalDateTime date;
    private Double amount;
    private String observation;

    public Income() {
    }

    public Income(Long id, LocalDateTime date, Double amount, String observation) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.observation = observation;
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

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }
}
