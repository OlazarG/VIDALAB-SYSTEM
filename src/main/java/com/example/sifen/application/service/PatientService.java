package com.example.sifen.application.service;

import com.example.sifen.application.dto.PatientRequestDTO;
import com.example.sifen.application.dto.PatientResponseDTO;
import com.example.sifen.application.mapper.PatientMapper;
import com.example.sifen.domain.model.Patient;
import com.example.sifen.domain.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    public PatientService(PatientRepository patientRepository, PatientMapper patientMapper) {
        this.patientRepository = patientRepository;
        this.patientMapper = patientMapper;
    }

    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patientMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientResponseDTO createPatient(PatientRequestDTO requestDTO) {
        Patient patient = patientMapper.toDomain(requestDTO);
        Patient savedPatient = patientRepository.save(patient);
        return patientMapper.toDTO(savedPatient);
    }
}
