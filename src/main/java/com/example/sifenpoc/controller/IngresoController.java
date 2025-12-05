package com.example.sifenpoc.controller;

import com.example.sifenpoc.entity.Ingreso;
import com.example.sifenpoc.repository.IngresoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/api/income")
public class IngresoController {

    @Autowired
    private IngresoRepository repository;

    @GetMapping
    public List<Ingreso> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Ingreso create(@RequestBody Ingreso ingreso, Principal principal) {
        if (principal != null) {
            ingreso.setUsuario(principal.getName());
        }
        return repository.save(ingreso);
    }
}
