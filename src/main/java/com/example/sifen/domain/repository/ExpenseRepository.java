package com.example.sifen.domain.repository;

import com.example.sifen.domain.model.Expense;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository {
    List<Expense> findAll();

    Optional<Expense> findById(Long id);

    Expense save(Expense expense);

    void deleteById(Long id);
}
