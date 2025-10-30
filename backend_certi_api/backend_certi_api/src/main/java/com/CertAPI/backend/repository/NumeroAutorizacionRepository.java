package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.NumeroAutorizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NumeroAutorizacionRepository extends JpaRepository<NumeroAutorizacion, Long> {
    Optional<NumeroAutorizacion> findByNumeroAutorizacion(String numeroAutorizacion);
    List<NumeroAutorizacion> findByUtilizadoFalse();
    Optional<NumeroAutorizacion> findFirstByUtilizadoFalseOrderByFechaGeneracionAsc();
}
