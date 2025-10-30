package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "anulacion_dte")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Added @Builder annotation for builder pattern support
public class AnulacionDTE {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "dte_id", nullable = false)
    private DTE dte;
    
    @Column(nullable = false)
    private String nitEmisor;
    
    @Column(nullable = false)
    private String numeroAutorizacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaEmisionDocumento;
    
    @Column(nullable = false)
    private LocalDateTime fechaAnulacion;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;
    
    @Column(columnDefinition = "TEXT")
    private String xmlAnulacion;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoAnulacion estado;
    
    private String motivoRechazo;
    
    @Column(columnDefinition = "TEXT")
    private String respuestaSAT;
    
    public enum EstadoAnulacion {
        SOLICITADA,
        APROBADA,
        RECHAZADA
    }
}
