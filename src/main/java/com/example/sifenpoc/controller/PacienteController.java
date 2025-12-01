package com.example.sifenpoc.controller;

import com.example.sifenpoc.entity.Paciente;
import com.example.sifenpoc.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PacienteController {

    @Autowired
    private PacienteRepository repository;

    @GetMapping
    public List<Paciente> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Paciente create(@RequestBody Paciente paciente) {
        return repository.save(paciente);
    }
}
