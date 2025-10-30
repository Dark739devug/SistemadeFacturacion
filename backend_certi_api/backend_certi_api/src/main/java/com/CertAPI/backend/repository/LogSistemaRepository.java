package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.LogSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogSistemaRepository extends JpaRepository<LogSistema, Long> {
    List<LogSistema> findByNivelLog(String nivelLog);
    List<LogSistema> findByModulo(String modulo);
    List<LogSistema> findByFechaLogBetween(LocalDateTime inicio, LocalDateTime fin);
    List<LogSistema> findByNivelLogAndModulo(String nivelLog, String modulo);
}
