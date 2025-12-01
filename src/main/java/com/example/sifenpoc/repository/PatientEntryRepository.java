package com.example.sifenpoc.repository;

import com.example.sifenpoc.entity.PatientEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PatientEntryRepository extends JpaRepository<PatientEntry, Long> {
    List<PatientEntry> findByDateBetween(LocalDateTime start, LocalDateTime end);
}
