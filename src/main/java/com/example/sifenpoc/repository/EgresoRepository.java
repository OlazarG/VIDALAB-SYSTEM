package com.example.sifenpoc.repository;

import com.example.sifenpoc.entity.Egreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EgresoRepository extends JpaRepository<Egreso, Long> {
    List<Egreso> findByFechaBetween(LocalDateTime start, LocalDateTime end);
}
