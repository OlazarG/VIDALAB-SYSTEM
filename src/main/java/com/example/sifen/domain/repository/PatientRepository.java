package com.example.sifen.domain.repository;

import com.example.sifen.domain.model.Patient;
import java.util.List;
import java.util.Optional;

public interface PatientRepository {
    List<Patient> findAll();

    Optional<Patient> findById(Long id);

    Patient save(Patient patient);

    void deleteById(Long id);
}
