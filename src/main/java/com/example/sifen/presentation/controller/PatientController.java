package com.example.sifen.presentation.controller;

import com.example.sifen.application.dto.PatientRequestDTO;
import com.example.sifen.application.dto.PatientResponseDTO;
import com.example.sifen.application.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<List<PatientResponseDTO>> getAll() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @PostMapping
    public ResponseEntity<PatientResponseDTO> create(@RequestBody PatientRequestDTO requestDTO) {
        return ResponseEntity.ok(patientService.createPatient(requestDTO));
    }
}
