package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;


import java.time.LocalDateTime;

@Entity
@Table(name = "login_sesiones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLogin;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonBackReference
    private Usuario usuario;

    @Column(nullable = false, length = 2048)
    private String token;

    private LocalDateTime fechaLogin;
    private LocalDateTime fechaLogout;

    @Column(length = 50)
    private String ipOrigen;

    @Column(length = 2048)
    private String dispositivo;

    @Column(nullable = false)
    private Boolean activo = true;
}
