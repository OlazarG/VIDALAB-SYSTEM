package com.example.sifenpoc.repository;

import com.example.sifenpoc.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    List<Paciente> findByFechaIngresoBetween(LocalDateTime start, LocalDateTime end);
}
