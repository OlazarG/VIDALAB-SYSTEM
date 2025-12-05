package com.example.sifenpoc.config;

import com.example.sifenpoc.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private UsuarioService usuarioService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .authorizeHttpRequests((requests) -> requests
                                                .requestMatchers("/login", "/login.html", "/css/**", "/js/**",
                                                                "/images/**")
                                                .permitAll()
                                                .requestMatchers("/api/users/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .formLogin((form) -> form
                                                .loginPage("/login.html")
                                                .loginProcessingUrl("/perform_login")
                                                .defaultSuccessUrl("/", true)
                                                .failureUrl("/login.html?error=true")
                                                .permitAll())
                                .logout((logout) -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login.html")
                                                .permitAll())
                                .csrf(csrf -> csrf.disable());

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @RestController
        public static class UserController {
                @GetMapping("/api/me")
                public Map<String, Object> getCurrentUser() {
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        Map<String, Object> response = new HashMap<>();
                        response.put("username", auth.getName());
                        response.put("role", auth.getAuthorities().stream()
                                        .findFirst()
                                        .map(a -> a.getAuthority().replace("ROLE_", ""))
                                        .orElse("USER"));
                        return response;
                }
        }
}
