package com.CertAPI.backend.dto;

import lombok.Data;

@Data
public class UsuarioUpdateDTO {
    private String nombreCompleto;
    private String email;
    private Long idRol;
    private String password; // Puede venir nulo o vacío si no se cambia
}