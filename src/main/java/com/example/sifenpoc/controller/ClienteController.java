package com.example.sifenpoc.controller;

import com.example.sifenpoc.entity.Cliente;
import com.example.sifenpoc.repository.ClienteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }

    @PostMapping
    public Cliente createCliente(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @PutMapping("/{id}")
    public Cliente updateCliente(@PathVariable Long id, @RequestBody Cliente clienteDetails) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    cliente.setRuc(clienteDetails.getRuc());
                    cliente.setRazonSocial(clienteDetails.getRazonSocial());
                    cliente.setEmail(clienteDetails.getEmail());
                    cliente.setTelefono(clienteDetails.getTelefono());
                    cliente.setDireccion(clienteDetails.getDireccion());
                    return clienteRepository.save(cliente);
                })
                .orElseGet(() -> {
                    clienteDetails.setId(id);
                    return clienteRepository.save(clienteDetails);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCliente(@PathVariable Long id) {
        try {
            clienteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message",
                    "ConstraintViolation: No se puede eliminar el cliente porque tiene registros asociados.");
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Error interno al eliminar el cliente: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
