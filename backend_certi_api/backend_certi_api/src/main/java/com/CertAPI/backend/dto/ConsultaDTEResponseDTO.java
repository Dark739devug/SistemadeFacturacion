package com.CertAPI.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaDTEResponseDTO {
    
    private String uuid;
    private String tipoDocumento;
    private String nitEmisor;
    private String nombreEmisor;
    private String nitReceptor;
    private String nombreReceptor;
    private LocalDateTime fechaEmision;
    private Double montoTotal;
    private String moneda;
    private String numeroAutorizacion;
    private String estado;
    private LocalDateTime fechaCertificacion;
    private String xmlCertificado;
    private String urlPDF;
}
