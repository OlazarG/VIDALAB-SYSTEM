package com.example.sifenpoc.service;

import com.example.sifenpoc.entity.Expense;
import com.example.sifenpoc.entity.Income;
import com.example.sifenpoc.entity.PatientEntry;
import com.example.sifenpoc.repository.ExpenseRepository;
import com.example.sifenpoc.repository.IncomeRepository;
import com.example.sifenpoc.repository.PatientEntryRepository;
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
    private IncomeRepository incomeRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private PatientEntryRepository patientEntryRepository;

    public ByteArrayInputStream generateIncomeReport(LocalDate date) throws IOException {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<Income> incomes = incomeRepository.findByDateBetween(start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ingresos");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Fecha", "Monto (Gs)", "Observación / Servicio" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (Income income : incomes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(income.getDate().format(formatter));
                row.createCell(1).setCellValue(income.getAmount());
                row.createCell(2).setCellValue(income.getObservation());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateExpenseReport(LocalDate date) throws IOException {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<Expense> expenses = expenseRepository.findByDateBetween(start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Egresos");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Fecha", "Monto (Gs)", "Beneficiario / Observación" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (Expense expense : expenses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(expense.getDate().format(formatter));
                row.createCell(1).setCellValue(expense.getAmount());
                row.createCell(2).setCellValue(expense.getBeneficiary());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generatePatientReport(LocalDate date) throws IOException {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        List<PatientEntry> entries = patientEntryRepository.findByDateBetween(start, end);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Pacientes");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Fecha", "Nombre del Paciente", "Monto Recibido (Gs)", "Saldo Pendiente (Gs)",
                    "Nro. Teléfono", "Contacto Adicional" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (PatientEntry entry : entries) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(entry.getDate().format(formatter));
                row.createCell(1).setCellValue(entry.getPatientName());
                row.createCell(2).setCellValue(entry.getAmountReceived());
                row.createCell(3).setCellValue(entry.getBalancePending() != null ? entry.getBalancePending() : 0.0);
                row.createCell(4).setCellValue(entry.getPhoneNumber());
                row.createCell(5).setCellValue(entry.getObservation());
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
