package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "facturas_certificadas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacturaCertificada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura_cert")
    private Long idFacturaCert;

    @Column(name = "id_transaccion", nullable = false, unique = true)
    private Long idTransaccion;

    @Column(name = "numero_autorizacion", nullable = false, unique = true, length = 100)
    private String numeroAutorizacion;

    @Column(name = "uuid_certificacion", nullable = false, unique = true)
    private UUID uuidCertificacion = UUID.randomUUID();

    @Column(name = "id_establecimiento_cert", nullable = false)
    private Long idEstablecimientoCert;

    @Column(name = "nit_emisor", nullable = false, length = 20)
    private String nitEmisor;

    @Column(name = "nombre_emisor", nullable = false, length = 200)
    private String nombreEmisor;

    @Column(name = "direccion_emisor", columnDefinition = "TEXT")
    private String direccionEmisor;

    @Column(name = "nit_receptor", nullable = false, length = 20)
    private String nitReceptor;

    @Column(name = "razon_social_receptor", nullable = false, length = 200)
    private String razonSocialReceptor;

    @Column(name = "direccion_receptor", columnDefinition = "TEXT")
    private String direccionReceptor;

    @Column(name = "tipo_documento", nullable = false, length = 10)
    private String tipoDocumento;

    @Column(name = "serie", nullable = false, length = 20)
    private String serie;

    @Column(name = "correlativo", nullable = false)
    private Integer correlativo;

    @Column(name = "numero_documento", nullable = false, length = 50)
    private String numeroDocumento;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "fecha_certificacion")
    private LocalDateTime fechaCertificacion = LocalDateTime.now();

    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "total_descuentos", precision = 12, scale = 2)
    private BigDecimal totalDescuentos = BigDecimal.ZERO;

    @Column(name = "total_iva", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalIva;

    @Column(name = "total_factura", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalFactura;

    @Column(name = "cantidad_items", nullable = false)
    private Integer cantidadItems;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "xml_original", nullable = false, columnDefinition = "TEXT")
    private String xmlOriginal;

    @Column(name = "xml_firmado", nullable = false, columnDefinition = "TEXT")
    private String xmlFirmado;

    @Column(name = "firma_digital", nullable = false, columnDefinition = "TEXT")
    private String firmaDigital;

    @Column(name = "estado_certificacion", nullable = false, length = 20)
    private String estadoCertificacion = "VIGENTE"; // VIGENTE, ANULADA

    @Column(name = "fecha_anulacion")
    private LocalDateTime fechaAnulacion;

    @Column(name = "motivo_anulacion", columnDefinition = "TEXT")
    private String motivoAnulacion;

    @Column(name = "id_usuario_anulacion", length = 100)
    private String idUsuarioAnulacion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_transaccion", insertable = false, updatable = false)
    private TransaccionCertificacion transaccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_establecimiento_cert", insertable = false, updatable = false)
    private EstablecimientoCertificado establecimiento;
}
