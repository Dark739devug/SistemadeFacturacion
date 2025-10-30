package com.CertAPI.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DTERequestDTO {
    
    @NotBlank(message = "El NIT del emisor es requerido")
    private String nitEmisor;
    
    @NotBlank(message = "El XML del DTE es requerido")
    private String xmlDTE;
    
    @NotBlank(message = "La firma electrónica es requerida")
    private String firmaElectronica;
    
    private String token; // Token de autenticación del emisor
}
