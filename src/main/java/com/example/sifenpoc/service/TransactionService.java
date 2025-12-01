package com.example.sifenpoc.service;

import com.example.sifenpoc.entity.Expense;
import com.example.sifenpoc.entity.Income;
import com.example.sifenpoc.entity.PatientEntry;
import com.example.sifenpoc.repository.ExpenseRepository;
import com.example.sifenpoc.repository.IncomeRepository;
import com.example.sifenpoc.repository.PatientEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TransactionService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private PatientEntryRepository patientEntryRepository;

    public Income saveIncome(Income income) {
        if (income.getDate() == null) {
            income.setDate(LocalDateTime.now());
        }
        return incomeRepository.save(income);
    }

    public Expense saveExpense(Expense expense) {
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }
        return expenseRepository.save(expense);
    }

    public PatientEntry savePatientEntry(PatientEntry entry) {
        if (entry.getDate() == null) {
            entry.setDate(LocalDateTime.now());
        }
        return patientEntryRepository.save(entry);
    }

    public java.util.List<Income> getRecentIncomes() {
        return incomeRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
    }

    public java.util.List<Expense> getRecentExpenses() {
        return expenseRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
    }

    public java.util.List<PatientEntry> getRecentPatientEntries() {
        return patientEntryRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
    }
}
