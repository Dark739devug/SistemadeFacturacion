package com.CertAPI.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    @NotBlank(message = "El username es requerido")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "El nombre completo es requerido")
    @Size(max = 200, message = "El nombre completo no puede exceder 200 caracteres")
    private String nombreCompleto;

    // Nuevo campo opcional para elegir el rol por ID
    @NotNull(message = "El rol es requerido")
    private Long idRol; // ID del rol en la tabla roles
}
