package com.example.sifen.domain.repository;

import com.example.sifen.domain.model.Income;
import java.util.List;
import java.util.Optional;

public interface IncomeRepository {
    List<Income> findAll();

    Optional<Income> findById(Long id);

    Income save(Income income);

    void deleteById(Long id);
}
