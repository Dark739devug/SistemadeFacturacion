package com.CertAPI.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnulacionRequestDTO {
    
    @NotBlank(message = "El NIT del emisor es requerido")
    private String nitEmisor;
    
    @NotBlank(message = "El número de autorización es requerido")
    private String numeroAutorizacion;
    
    @NotBlank(message = "El motivo de anulación es requerido")
    private String motivo;
    
    @NotBlank(message = "El XML de anulación es requerido")
    private String xmlAnulacion;
    
    private String token;
}
