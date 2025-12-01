package com.example.sifenpoc.repository;

import com.example.sifenpoc.entity.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
    List<Factura> findAllByOrderByFechaEmisionDesc();
}
