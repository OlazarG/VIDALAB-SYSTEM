package com.example.sifenpoc.service;

import com.example.sifenpoc.entity.Egreso;
import com.example.sifenpoc.entity.Ingreso;
import com.example.sifenpoc.entity.Paciente;
import com.example.sifenpoc.repository.EgresoRepository;
import com.example.sifenpoc.repository.IngresoRepository;
import com.example.sifenpoc.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CajaService {

    @Autowired
    private IngresoRepository ingresoRepository;

    @Autowired
    private EgresoRepository egresoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    public Map<String, Object> getDailySummary(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Ingreso> ingresos = ingresoRepository.findByFechaBetween(startOfDay, endOfDay);
        List<Egreso> egresos = egresoRepository.findByFechaBetween(startOfDay, endOfDay);
        List<Paciente> pacientes = pacienteRepository.findByFechaIngresoBetween(startOfDay, endOfDay);

        double totalIngresos = ingresos.stream().mapToDouble(Ingreso::getMonto).sum();
        double totalPacientes = pacientes.stream().mapToDouble(p -> p.getMonto() != null ? p.getMonto() : 0.0).sum();
        double totalEgresos = egresos.stream().mapToDouble(Egreso::getMonto).sum();

        double saldoCaja = (totalIngresos + totalPacientes) - totalEgresos;

        Map<String, Object> summary = new HashMap<>();
        summary.put("date", date);
        summary.put("ingresos", ingresos);
        summary.put("egresos", egresos);
        summary.put("pacientes", pacientes);
        summary.put("totalIngresos", totalIngresos);
        summary.put("totalPacientes", totalPacientes);
        summary.put("totalEgresos", totalEgresos);
        summary.put("saldoCaja", saldoCaja);

        return summary;
    }
}
