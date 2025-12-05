package com.example.sifenpoc.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaIngreso;
    private String nombre;
    private Double monto; // Monto pagado/ingresado
    private Double saldo; // Saldo pendiente
    private String telefono;
    private String observacion;
    private String motivoConsulta;
    private String metodoPago; // "Efectivo" o "POS"
    private String usuario; // Usuario que registró el paciente
    private Long clientId;

    public Paciente() {
    }

    public Paciente(LocalDateTime fechaIngreso, String nombre, Double monto, Double saldo, String telefono,
            String observacion, String motivoConsulta, String metodoPago) {
        this.fechaIngreso = fechaIngreso;
        this.nombre = nombre;
        this.monto = monto;
        this.saldo = saldo;
        this.telefono = telefono;
        this.observacion = observacion;
        this.motivoConsulta = motivoConsulta;
        this.metodoPago = metodoPago;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDateTime fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Double getMonto() {
        return monto;
    }

    public void setMonto(Double monto) {
        this.monto = monto;
    }

    public Double getSaldo() {
        return saldo;
    }

    public void setSaldo(Double saldo) {
        this.saldo = saldo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }
}
