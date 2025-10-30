package com.CertAPI.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "logs_sistema")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log")
    private Long idLog;

    @Column(name = "nivel_log", nullable = false, length = 20)
    private String nivelLog; // DEBUG, INFO, WARNING, ERROR, CRITICAL

    @Column(name = "modulo", length = 100)
    private String modulo;

    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "datos_adicionales", columnDefinition = "jsonb")
    private Map<String, Object> datosAdicionales;

    @Column(name = "ip_origen", length = 50)
    private String ipOrigen;

    @Column(name = "fecha_log")
    private LocalDateTime fechaLog = LocalDateTime.now();
}
