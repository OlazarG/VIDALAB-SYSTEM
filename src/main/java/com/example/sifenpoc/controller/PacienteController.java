package com.example.sifenpoc.controller;

import com.example.sifenpoc.entity.Paciente;
import com.example.sifenpoc.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.security.Principal;

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
    public Paciente create(@RequestBody Paciente paciente, Principal principal) {
        if (principal != null) {
            paciente.setUsuario(principal.getName());
        }
        System.out.println("Received Paciente: " + paciente.getNombre());
        System.out.println("ClientId: " + paciente.getClientId());
        System.out.println("Usuario: " + paciente.getUsuario());
        return repository.save(paciente);
    }
}
