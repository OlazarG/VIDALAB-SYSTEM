package com.example.sifenpoc.controller;

import com.example.sifenpoc.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api")
public class TransactionController {

    @Autowired
    private ReportService reportService;

    /*
     * @GetMapping("/income")
     * public ResponseEntity<List<Income>> getIncomes() {
     * return ResponseEntity.ok(transactionService.getRecentIncomes());
     * }
     * 
     * @PostMapping("/income")
     * public ResponseEntity<Income> createIncome(@RequestBody Income income) {
     * return ResponseEntity.ok(transactionService.saveIncome(income));
     * }
     * 
     * @GetMapping("/expense")
     * public ResponseEntity<List<Expense>> getExpenses() {
     * return ResponseEntity.ok(transactionService.getRecentExpenses());
     * }
     * 
     * @PostMapping("/expense")
     * public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
     * return ResponseEntity.ok(transactionService.saveExpense(expense));
     * }
     * 
     * @GetMapping("/patient")
     * public ResponseEntity<List<PatientEntry>> getPatients() {
     * return ResponseEntity.ok(transactionService.getRecentPatientEntries());
     * }
     * 
     * @PostMapping("/patient")
     * public ResponseEntity<PatientEntry> createPatientEntry(@RequestBody
     * PatientEntry entry) {
     * return ResponseEntity.ok(transactionService.savePatientEntry(entry));
     * }
     */

    @GetMapping("/reports/income")
    public ResponseEntity<InputStreamResource> downloadIncomeReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
            throws IOException {
        ByteArrayInputStream in = reportService.generateIncomeReport(date != null ? date : LocalDate.now());
        String filename = "Reporte_Ingresos_" + (date != null ? date : LocalDate.now()) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/reports/expense")
    public ResponseEntity<InputStreamResource> downloadExpenseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
            throws IOException {
        ByteArrayInputStream in = reportService.generateExpenseReport(date != null ? date : LocalDate.now());
        String filename = "Reporte_Egresos_" + (date != null ? date : LocalDate.now()) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/reports/patient")
    public ResponseEntity<InputStreamResource> downloadPatientReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
            throws IOException {
        ByteArrayInputStream in = reportService.generatePatientReport(date != null ? date : LocalDate.now());
        String filename = "Reporte_Pacientes_" + (date != null ? date : LocalDate.now()) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }
}
