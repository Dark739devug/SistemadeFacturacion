package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "series_autorizadas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SerieAutorizada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_serie")
    private Long idSerie;

    @Column(name = "id_establecimiento_cert", nullable = false)
    private Long idEstablecimientoCert;

    @Column(name = "serie", nullable = false, length = 20)
    private String serie;

    @Column(name = "tipo_documento", nullable = false, length = 10)
    private String tipoDocumento;

    @Column(name = "correlativo_inicial", nullable = false)
    private Integer correlativoInicial = 1;

    @Column(name = "correlativo_actual", nullable = false)
    private Integer correlativoActual = 0;

    @Column(name = "correlativo_final")
    private Integer correlativoFinal;

    @Column(name = "fecha_autorizacion")
    private LocalDateTime fechaAutorizacion = LocalDateTime.now();

    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento;

    @Column(name = "activa")
    private Boolean activa = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_establecimiento_cert", insertable = false, updatable = false)
    private EstablecimientoCertificado establecimiento;
}
