package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "emisores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Emisor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nitEmisor;

    @Column(nullable = false)
    private String nombreComercial;

    @Column(nullable = false)
    private String correoEmisor;

    @Lob
    @Column(nullable = false)
    private String firmaElectronica; // Base64 o PEM

    @Column(nullable = false)
    private Boolean activo = true;
}
