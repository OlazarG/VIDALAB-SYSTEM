package com.example.sifen.domain.repository;

import com.example.sifen.domain.model.Client;
import java.util.List;
import java.util.Optional;

public interface ClientRepository {
    List<Client> findAll();

    Optional<Client> findById(Long id);

    Optional<Client> findByRuc(String ruc);

    Client save(Client client);

    void deleteById(Long id);
}
