package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.DTE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DTERepository extends JpaRepository<DTE, Long> {
    
    Optional<DTE> findByUuid(String uuid);
    
    Optional<DTE> findByNumeroAutorizacion(String numeroAutorizacion);
    
    List<DTE> findByNitEmisor(String nitEmisor);
    
    List<DTE> findByNitEmisorAndEstado(String nitEmisor, DTE.EstadoDTE estado);
    
    List<DTE> findByEstado(DTE.EstadoDTE estado);
    
    List<DTE> findByFechaEmisionBetween(LocalDateTime inicio, LocalDateTime fin);
    
    List<DTE> findByNitEmisorAndFechaEmisionBetween(String nitEmisor, LocalDateTime inicio, LocalDateTime fin);
}
