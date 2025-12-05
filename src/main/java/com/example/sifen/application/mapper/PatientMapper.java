package com.example.sifen.application.mapper;

import com.example.sifen.application.dto.PatientRequestDTO;
import com.example.sifen.application.dto.PatientResponseDTO;
import com.example.sifen.domain.model.Patient;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PatientMapper {

    public Patient toDomain(PatientRequestDTO dto) {
        if (dto == null)
            return null;
        Patient patient = new Patient();
        patient.setClientId(dto.getClientId());
        patient.setVisitReason(dto.getVisitReason());
        patient.setAmountPaid(dto.getAmountPaid());
        patient.setBalance(dto.getBalance());
        patient.setObservation(dto.getObservation());
        // Set default admission date
        patient.setAdmissionDate(LocalDateTime.now());
        return patient;
    }

    public PatientResponseDTO toDTO(Patient domain) {
        if (domain == null)
            return null;
        return new PatientResponseDTO(
                domain.getId(),
                domain.getAdmissionDate(),
                domain.getName(),
                domain.getAmountPaid(),
                domain.getBalance(),
                domain.getPhone(),
                domain.getObservation(),
                domain.getClientId(),
                domain.getVisitReason());
    }
}
