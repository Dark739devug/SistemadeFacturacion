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
public class DTEResponseDTO {
    
    private String uuid;
    private String numeroAutorizacion;
    private String estado;
    private String mensaje;
    private LocalDateTime fechaCertificacion;
    private String xmlCertificado;
    private String firmaCertificador;
    private String urlPDF;
}
