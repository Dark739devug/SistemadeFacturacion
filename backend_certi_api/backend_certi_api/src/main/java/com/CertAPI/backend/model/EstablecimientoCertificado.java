package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "establecimientos_certificados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstablecimientoCertificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_establecimiento_cert")
    private Long idEstablecimientoCert;

    @Column(name = "nit", nullable = false, unique = true, length = 20)
    private String nit;

    @Column(name = "razon_social", nullable = false, length = 200)
    private String razonSocial;

    @Column(name = "nombre_comercial", nullable = false, length = 200)
    private String nombreComercial;

    @Column(name = "direccion", nullable = false, columnDefinition = "TEXT")
    private String direccion;

    @Column(name = "codigo_establecimiento", nullable = false, unique = true, length = 10)
    private String codigoEstablecimiento;

    @Column(name = "email_contacto", length = 150)
    private String emailContacto;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "estado_certificador", nullable = false, length = 20)
    private String estadoCertificador = "ACTIVO"; // ACTIVO, SUSPENDIDO, INACTIVO

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(name = "fecha_activacion")
    private LocalDateTime fechaActivacion;

    @Column(name = "fecha_suspension")
    private LocalDateTime fechaSuspension;

    @Column(name = "motivo_suspension", columnDefinition = "TEXT")
    private String motivoSuspension;

    @Column(name = "limite_facturas_diarias")
    private Integer limiteFacturasDiarias = 1000;

    @Column(name = "facturas_emitidas_hoy")
    private Integer facturasEmitidasHoy = 0;

    @Column(name = "ultima_factura_fecha")
    private LocalDate ultimaFacturaFecha;

    @Column(name = "activo")
    private Boolean activo = true;
}
