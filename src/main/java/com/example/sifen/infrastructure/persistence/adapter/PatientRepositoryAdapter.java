package com.example.sifen.infrastructure.persistence.adapter;

import com.example.sifen.domain.model.Patient;
import com.example.sifen.domain.repository.PatientRepository;
import com.example.sifen.infrastructure.persistence.entity.PatientEntity;
import com.example.sifen.infrastructure.persistence.repository.JpaPatientRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class PatientRepositoryAdapter implements PatientRepository {

    private final JpaPatientRepository jpaRepository;

    public PatientRepositoryAdapter(JpaPatientRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Patient> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Patient> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Patient save(Patient patient) {
        PatientEntity entity = toEntity(patient);
        PatientEntity savedEntity = jpaRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    // Manual Mappers for Adapter (Infrastructure <-> Domain)
    private Patient toDomain(PatientEntity entity) {
        if (entity == null)
            return null;
        return new Patient(
                entity.getId(),
                entity.getAdmissionDate(),
                entity.getName(),
                entity.getAmountPaid(),
                entity.getBalance(),
                entity.getPhone(),
                entity.getObservation(),
                entity.getClientId(),
                entity.getVisitReason());
    }

    private PatientEntity toEntity(Patient patient) {
        if (patient == null)
            return null;
        PatientEntity entity = new PatientEntity();
        entity.setId(patient.getId());
        entity.setAdmissionDate(patient.getAdmissionDate());
        entity.setName(patient.getName());
        entity.setAmountPaid(patient.getAmountPaid());
        entity.setBalance(patient.getBalance());
        entity.setPhone(patient.getPhone());
        entity.setObservation(patient.getObservation());
        entity.setClientId(patient.getClientId());
        entity.setVisitReason(patient.getVisitReason());
        return entity;
    }
}
