package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "estadisticas_diarias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estadistica")
    private Long idEstadistica;

    @Column(name = "fecha_estadistica", nullable = false)
    private LocalDate fechaEstadistica;

    @Column(name = "id_establecimiento_cert")
    private Long idEstablecimientoCert;

    @Column(name = "total_solicitudes")
    private Integer totalSolicitudes = 0;

    @Column(name = "total_certificadas")
    private Integer totalCertificadas = 0;

    @Column(name = "total_rechazadas")
    private Integer totalRechazadas = 0;

    @Column(name = "total_anuladas")
    private Integer totalAnuladas = 0;

    @Column(name = "monto_total_certificado", precision = 15, scale = 2)
    private BigDecimal montoTotalCertificado = BigDecimal.ZERO;

    @Column(name = "monto_total_iva", precision = 15, scale = 2)
    private BigDecimal montoTotalIva = BigDecimal.ZERO;

    @Column(name = "tiempo_promedio_certificacion_ms")
    private Integer tiempoPromedioCertificacion;

    @Column(name = "tiempo_minimo_certificacion_ms")
    private Integer tiempoMinimoCertificacion;

    @Column(name = "tiempo_maximo_certificacion_ms")
    private Integer tiempoMaximoCertificacion;

    @Column(name = "fecha_calculo")
    private LocalDateTime fechaCalculo = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_establecimiento_cert", insertable = false, updatable = false)
    private EstablecimientoCertificado establecimiento;
}
