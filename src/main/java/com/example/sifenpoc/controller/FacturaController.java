package com.example.sifenpoc.controller;

import com.example.sifenpoc.dto.FacturaDTO;
import com.example.sifenpoc.entity.Factura;
import com.example.sifenpoc.service.SifenService;
import com.example.sifenpoc.service.FacturaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FacturaController {

    private final SifenService sifenService;
    private final FacturaService facturaService;

    public FacturaController(SifenService sifenService, FacturaService facturaService) {
        this.sifenService = sifenService;
        this.facturaService = facturaService;
    }

    @PostMapping("/facturar")
    public String facturar(@RequestBody FacturaDTO facturaDTO) {
        return sifenService.procesarFactura(facturaDTO);
    }

    @PostMapping("/facturas")
    public ResponseEntity<Factura> crearFactura(@RequestBody Factura factura) {
        Factura facturaCreada = facturaService.crearFactura(factura);
        return ResponseEntity.ok(facturaCreada);
    }

    @GetMapping("/facturas")
    public ResponseEntity<List<Factura>> obtenerFacturas() {
        List<Factura> facturas = facturaService.obtenerTodasLasFacturas();
        return ResponseEntity.ok(facturas);
    }
}
