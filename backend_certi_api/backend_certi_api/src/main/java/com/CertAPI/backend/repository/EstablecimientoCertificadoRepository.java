package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.EstablecimientoCertificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstablecimientoCertificadoRepository extends JpaRepository<EstablecimientoCertificado, Long> {
    Optional<EstablecimientoCertificado> findByNit(String nit);
    Optional<EstablecimientoCertificado> findByCodigoEstablecimiento(String codigoEstablecimiento);
    List<EstablecimientoCertificado> findByEstadoCertificador(String estadoCertificador);
    List<EstablecimientoCertificado> findByActivoTrue();
}
