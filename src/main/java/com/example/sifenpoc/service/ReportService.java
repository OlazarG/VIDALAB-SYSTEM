package com.example.sifenpoc.service;

import com.example.sifenpoc.entity.Ingreso;
import com.example.sifenpoc.entity.Egreso;
import com.example.sifenpoc.entity.Paciente;
import com.example.sifenpoc.repository.IngresoRepository;
import com.example.sifenpoc.repository.EgresoRepository;
import com.example.sifenpoc.repository.PacienteRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private IngresoRepository ingresoRepository;

    @Autowired
    private EgresoRepository egresoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    public ByteArrayInputStream generateIncomeReport(LocalDate date) throws IOException {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<Ingreso> ingresos = ingresoRepository.findByFechaBetween(start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ingresos");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Fecha", "Monto (Gs)", "Tipo", "Método Pago", "Observación" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (Ingreso ingreso : ingresos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(ingreso.getFecha().format(formatter));
                row.createCell(1).setCellValue(ingreso.getMonto());
                row.createCell(2).setCellValue(ingreso.getTipo() != null ? ingreso.getTipo() : "");
                row.createCell(3).setCellValue(ingreso.getMetodoPago() != null ? ingreso.getMetodoPago() : "");
                row.createCell(4).setCellValue(ingreso.getObservacion() != null ? ingreso.getObservacion() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateExpenseReport(LocalDate date) throws IOException {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<Egreso> egresos = egresoRepository.findByFechaBetween(start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Egresos");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Fecha", "Monto (Gs)", "Beneficiario", "Método Pago" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (Egreso egreso : egresos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(egreso.getFecha().format(formatter));
                row.createCell(1).setCellValue(egreso.getMonto());
                row.createCell(2).setCellValue(egreso.getBeneficiario() != null ? egreso.getBeneficiario() : "");
                row.createCell(3).setCellValue(egreso.getMetodoPago() != null ? egreso.getMetodoPago() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generatePatientReport(LocalDate date) throws IOException {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<Paciente> pacientes = pacienteRepository.findByFechaIngresoBetween(start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Pacientes");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Fecha", "Nombre", "Monto (Gs)", "Saldo (Gs)", "Teléfono", "Observación" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (Paciente paciente : pacientes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(paciente.getFechaIngreso().format(formatter));
                row.createCell(1).setCellValue(paciente.getNombre() != null ? paciente.getNombre() : "");
                row.createCell(2).setCellValue(paciente.getMonto() != null ? paciente.getMonto() : 0.0);
                row.createCell(3).setCellValue(paciente.getSaldo() != null ? paciente.getSaldo() : 0.0);
                row.createCell(4).setCellValue(paciente.getTelefono() != null ? paciente.getTelefono() : "");
                row.createCell(5).setCellValue(paciente.getObservacion() != null ? paciente.getObservacion() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}
