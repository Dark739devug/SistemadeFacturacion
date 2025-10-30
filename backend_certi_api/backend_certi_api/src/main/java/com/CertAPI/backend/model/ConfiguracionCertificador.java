package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_certificador")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionCertificador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_config")
    private Long idConfig;

    @Column(name = "clave", nullable = false, unique = true, length = 100)
    private String clave;

    @Column(name = "valor", nullable = false, columnDefinition = "TEXT")
    private String valor;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tipo_dato", length = 20)
    private String tipoDato = "STRING";

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion = LocalDateTime.now();
}
