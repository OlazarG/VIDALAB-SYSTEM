package com.example.sifenpoc.controller;

import com.example.sifenpoc.entity.Egreso;
import com.example.sifenpoc.repository.EgresoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/api/expense")
public class EgresoController {

    @Autowired
    private EgresoRepository repository;

    @GetMapping
    public List<Egreso> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Egreso create(@RequestBody Egreso egreso, Principal principal) {
        if (principal != null) {
            egreso.setUsuario(principal.getName());
        }
        return repository.save(egreso);
    }
}
