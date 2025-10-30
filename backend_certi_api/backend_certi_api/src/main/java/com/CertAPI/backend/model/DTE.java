package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "dte")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Added @Builder annotation for builder pattern support
public class DTE {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String uuid; // UUID del DTE
    
    @Column(nullable = false)
    private String tipoDocumento; // FACT, FCAM, FPEQ, NCRE, NDEB, etc.
    
    @Column(nullable = false)
    private String nitEmisor;
    
    @Column(nullable = false)
    private String nombreEmisor;
    
    private String nitReceptor;
    
    private String nombreReceptor;
    
    @Column(nullable = false)
    private LocalDateTime fechaEmision;
    
    @Column(nullable = false)
    private Double montoTotal;
    
    @Column(nullable = false)
    private String moneda; // GTQ, USD
    
    @Column(columnDefinition = "TEXT")
    private String xmlOriginal; // XML enviado por el emisor
    
    @Column(columnDefinition = "TEXT")
    private String xmlCertificado; // XML con firma del certificador
    
    @Column(unique = true)
    private String numeroAutorizacion; // Número de autorización SAT
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoDTE estado; // RECIBIDO, CERTIFICADO, RECHAZADO, ANULADO
    
    private String motivoRechazo;
    
    @Column(nullable = false)
    private LocalDateTime fechaRecepcion;
    
    private LocalDateTime fechaCertificacion;
    
    @Column(columnDefinition = "TEXT")
    private String firmaEmisor; // Firma electrónica del emisor
    
    @Column(columnDefinition = "TEXT")
    private String firmaCertificador; // Firma electrónica del certificador
    
    @Column(columnDefinition = "TEXT")
    private String respuestaSAT; // Respuesta de la SAT
    
    private LocalDateTime fechaEnvioSAT;
    
    public enum EstadoDTE {
        RECIBIDO,
        VALIDANDO,
        CERTIFICADO,
        RECHAZADO,
        ANULADO,
        ENVIADO_SAT
    }
}
