package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "numeros_autorizacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NumeroAutorizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_numero_autorizacion")
    private Long idNumeroAutorizacion;

    @Column(name = "numero_autorizacion", nullable = false, unique = true, length = 100)
    private String numeroAutorizacion;

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion = LocalDateTime.now();

    @Column(name = "utilizado")
    private Boolean utilizado = false;

    @Column(name = "fecha_utilizacion")
    private LocalDateTime fechaUtilizacion;

    @Column(name = "id_factura_cert")
    private Long idFacturaCert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_factura_cert", insertable = false, updatable = false)
    private FacturaCertificada facturaCertificada;
}
