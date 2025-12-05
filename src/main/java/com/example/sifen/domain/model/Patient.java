package com.example.sifen.domain.model;

import java.time.LocalDateTime;

public class Patient {
    private Long id;
    private LocalDateTime admissionDate;
    private String name;
    private Double amountPaid;
    private Double balance;
    private String phone;
    private String observation;
    private Long clientId;
    private String visitReason;

    public Patient() {
    }

    public Patient(Long id, LocalDateTime admissionDate, String name, Double amountPaid, Double balance, String phone,
            String observation, Long clientId, String visitReason) {
        this.id = id;
        this.admissionDate = admissionDate;
        this.name = name;
        this.amountPaid = amountPaid;
        this.balance = balance;
        this.phone = phone;
        this.observation = observation;
        this.clientId = clientId;
        this.visitReason = visitReason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDateTime admissionDate) {
        this.admissionDate = admissionDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getVisitReason() {
        return visitReason;
    }

    public void setVisitReason(String visitReason) {
        this.visitReason = visitReason;
    }
}
