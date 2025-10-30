package com.CertAPI.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacturaResponseDTO {
    private Long idFactura;
    private String numeroFactura;
    private String serie;
    private String nombreCliente;
    private String nitCliente;
    private String direccionCliente;
    private LocalDateTime fechaEmision;
    private BigDecimal subtotal;
    private BigDecimal iva;
    private BigDecimal total;
    private String estadoCertificacion;
    private String uuidFel;
    private String numeroAutorizacion;
    private LocalDateTime fechaCertificacion;
    private String mensajeError;
    private List<DetalleFacturaDTO> detalles;
    private String usuarioCreador;
    private LocalDateTime fechaCreacion;
}
