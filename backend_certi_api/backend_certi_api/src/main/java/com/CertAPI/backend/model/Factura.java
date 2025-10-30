package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "facturas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFactura;

    @Column(nullable = false, unique = true, length = 100)
    private String numeroFactura;

    @Column(nullable = false, length = 100)
    private String serie;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 200)
    private String nombreCliente;

    @Column(nullable = false, length = 20)
    private String nitCliente;

    @Column(length = 200)
    private String direccionCliente;

    @Column(nullable = false)
    private LocalDateTime fechaEmision;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal iva;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(length = 50)
    private String estadoCertificacion = "PENDIENTE"; // PENDIENTE, CERTIFICADA, RECHAZADA, ERROR

    @Column(length = 200)
    private String uuidFel;

    @Column(length = 100)
    private String numeroAutorizacion;

    private LocalDateTime fechaCertificacion;

    @Column(columnDefinition = "TEXT")
    private String xmlCertificado;

    @Column(columnDefinition = "TEXT")
    private String mensajeError;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleFactura> detalles;

    @Column(nullable = false)
    private Boolean activo = true;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
