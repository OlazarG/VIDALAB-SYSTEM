package com.example.sifenpoc.repository;

import com.example.sifenpoc.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByDateBetween(LocalDateTime start, LocalDateTime end);
}
