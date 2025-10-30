package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_facturas_certificadas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleFacturaCertificada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_cert")
    private Long idDetalleCert;

    @Column(name = "id_factura_cert", nullable = false)
    private Long idFacturaCert;

    @Column(name = "numero_linea", nullable = false)
    private Integer numeroLinea;

    @Column(name = "codigo_producto", length = 50)
    private String codigoProducto;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    @Column(name = "cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "unidad_medida", nullable = false, length = 20)
    private String unidadMedida;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "descuento", precision = 12, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "subtotal_linea", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalLinea;

    @Column(name = "monto_iva", precision = 12, scale = 2)
    private BigDecimal montoIva = BigDecimal.ZERO;

    @Column(name = "total_linea", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalLinea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_factura_cert", insertable = false, updatable = false)
    private FacturaCertificada facturaCertificada;
}
