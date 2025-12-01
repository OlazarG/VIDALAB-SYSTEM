package com.example.sifenpoc.repository;

import com.example.sifenpoc.entity.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long> {
    List<Ingreso> findByFechaBetween(LocalDateTime start, LocalDateTime end);
}
