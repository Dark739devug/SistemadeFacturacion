package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "anulaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Anulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_anulacion")
    private Long idAnulacion;

    @Column(name = "id_factura_cert", nullable = false)
    private Long idFacturaCert;

    @Column(name = "numero_autorizacion", nullable = false, length = 100)
    private String numeroAutorizacion;

    @Column(name = "fecha_solicitud_anulacion")
    private LocalDateTime fechaSolicitudAnulacion = LocalDateTime.now();

    @Column(name = "fecha_anulacion")
    private LocalDateTime fechaAnulacion;

    @Column(name = "motivo_anulacion", nullable = false, columnDefinition = "TEXT")
    private String motivoAnulacion;

    @Column(name = "usuario_anulacion", length = 100)
    private String usuarioAnulacion;

    @Column(name = "ip_origen", length = 50)
    private String ipOrigen;

    @Column(name = "estado_anulacion", nullable = false, length = 20)
    private String estadoAnulacion = "PENDIENTE"; // PENDIENTE, APROBADA, RECHAZADA

    @Column(name = "codigo_respuesta", length = 20)
    private String codigoRespuesta;

    @Column(name = "mensaje_respuesta", columnDefinition = "TEXT")
    private String mensajeRespuesta;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "datos_factura_original", columnDefinition = "jsonb")
    private Map<String, Object> datosFacturaOriginal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_factura_cert", insertable = false, updatable = false)
    private FacturaCertificada facturaCertificada;
}
