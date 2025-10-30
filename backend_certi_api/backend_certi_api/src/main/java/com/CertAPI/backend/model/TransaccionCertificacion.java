package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "transacciones_certificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransaccionCertificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transaccion")
    private Long idTransaccion;

    @Column(name = "uuid_transaccion", nullable = false, unique = true)
    private UUID uuidTransaccion = UUID.randomUUID();

    @Column(name = "id_establecimiento_cert", nullable = false)
    private Long idEstablecimientoCert;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    @Column(name = "ip_origen", length = 50)
    private String ipOrigen;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "datos_solicitud", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> datosSolicitud;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "codigo_respuesta", nullable = false, length = 20)
    private String codigoRespuesta;

    @Column(name = "mensaje_respuesta", columnDefinition = "TEXT")
    private String mensajeRespuesta;

    @Column(name = "exitosa", nullable = false)
    private Boolean exitosa = false;

    @Column(name = "numero_autorizacion", unique = true, length = 100)
    private String numeroAutorizacion;

    @Column(name = "serie_asignada", length = 20)
    private String serieAsignada;

    @Column(name = "correlativo_asignado")
    private Integer correlativoAsignado;

    @Column(name = "nit_emisor", length = 20)
    private String nitEmisor;

    @Column(name = "nit_receptor", length = 20)
    private String nitReceptor;

    @Column(name = "total_factura", precision = 12, scale = 2)
    private BigDecimal totalFactura;

    @Column(name = "tiempo_procesamiento_ms")
    private Integer tiempoProcesamiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_establecimiento_cert", insertable = false, updatable = false)
    private EstablecimientoCertificado establecimiento;
}
