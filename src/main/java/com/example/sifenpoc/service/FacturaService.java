package com.example.sifenpoc.service;

import com.example.sifenpoc.entity.DetalleFactura;
import com.example.sifenpoc.entity.Factura;
import com.example.sifenpoc.repository.FacturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private static final String CDC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();

    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    @Transactional
    public Factura crearFactura(Factura factura) {
        // Generar CDC de 44 caracteres
        factura.setCdc(generarCDC());

        // Establecer fecha de emisión
        factura.setFechaEmision(LocalDateTime.now());

        // Calcular subtotales de cada detalle
        for (DetalleFactura detalle : factura.getDetalles()) {
            detalle.calcularSubtotal();
            detalle.setFactura(factura);
        }

        // Calcular totales
        calcularTotales(factura);

        return facturaRepository.save(factura);
    }

    public List<Factura> obtenerTodasLasFacturas() {
        return facturaRepository.findAllByOrderByFechaEmisionDesc();
    }

    private String generarCDC() {
        StringBuilder cdc = new StringBuilder(44);
        for (int i = 0; i < 44; i++) {
            cdc.append(CDC_CHARS.charAt(random.nextInt(CDC_CHARS.length())));
        }
        return cdc.toString();
    }

    private void calcularTotales(Factura factura) {
        double totalIva5 = 0.0;
        double totalIva10 = 0.0;
        double totalExento = 0.0;

        for (DetalleFactura detalle : factura.getDetalles()) {
            double subtotal = detalle.getSubtotal();

            switch (detalle.getTasaIva()) {
                case "IVA_10":
                    // El subtotal ya incluye el IVA, calculamos el monto del IVA
                    totalIva10 += subtotal * 0.10 / 1.10;
                    break;
                case "IVA_5":
                    totalIva5 += subtotal * 0.05 / 1.05;
                    break;
                case "EXENTO":
                    totalExento += subtotal;
                    break;
            }
        }

        factura.setTotalIva5(totalIva5);
        factura.setTotalIva10(totalIva10);
        factura.setTotalExento(totalExento);

        // Total general es la suma de todos los subtotales
        double totalGeneral = factura.getDetalles().stream()
                .mapToDouble(DetalleFactura::getSubtotal)
                .sum();
        factura.setTotalGeneral(totalGeneral);
    }
}
