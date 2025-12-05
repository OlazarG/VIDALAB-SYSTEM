package com.example.sifen.infrastructure.persistence.repository;

import com.example.sifen.infrastructure.persistence.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaPatientRepository extends JpaRepository<PatientEntity, Long> {
}
