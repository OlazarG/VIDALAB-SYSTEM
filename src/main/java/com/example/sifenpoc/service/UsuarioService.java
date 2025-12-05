package com.example.sifenpoc.service;

import com.example.sifenpoc.entity.Usuario;
import com.example.sifenpoc.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.Collections;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRole())));
    }

    public Usuario create(String username, String password, String role) {
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        return repository.save(u);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public void updatePassword(Long id, String newPassword) {
        Usuario u = repository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setPassword(passwordEncoder.encode(newPassword));
        repository.save(u);
    }

    @PostConstruct
    public void init() {
        if (repository.count() == 0) {
            System.out.println("No users found. Creating default admin user.");
            create("admin", "admin", "ADMIN");
        }
    }
}
