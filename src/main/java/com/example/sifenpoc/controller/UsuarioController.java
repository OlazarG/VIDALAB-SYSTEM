package com.example.sifenpoc.controller;

import com.example.sifenpoc.entity.Usuario;
import com.example.sifenpoc.repository.UsuarioRepository;
import com.example.sifenpoc.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private UsuarioService service;

    @GetMapping
    public List<Usuario> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Usuario usuario) {
        if (repository.findByUsername(usuario.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("El nombre de usuario ya existe");
        }
        return ResponseEntity.ok(service.create(usuario.getUsername(), usuario.getPassword(), "USER")); // Default to
                                                                                                        // USER role for
                                                                                                        // now, or read
                                                                                                        // from body if
                                                                                                        // needed
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña no puede estar vacía");
        }
        service.updatePassword(id, newPassword);
        return ResponseEntity.ok().build();
    }
}
