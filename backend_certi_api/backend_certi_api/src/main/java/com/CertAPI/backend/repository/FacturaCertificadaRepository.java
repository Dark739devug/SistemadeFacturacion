package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.FacturaCertificada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacturaCertificadaRepository extends JpaRepository<FacturaCertificada, Long> {
    Optional<FacturaCertificada> findByNumeroAutorizacion(String numeroAutorizacion);
    Optional<FacturaCertificada> findByUuidCertificacion(UUID uuidCertificacion);
    List<FacturaCertificada> findByNitEmisor(String nitEmisor);
    List<FacturaCertificada> findByNitReceptor(String nitReceptor);
    List<FacturaCertificada> findByIdEstablecimientoCert(Long idEstablecimientoCert);
    List<FacturaCertificada> findByEstadoCertificacion(String estadoCertificacion);
    List<FacturaCertificada> findByFechaCertificacionBetween(LocalDateTime inicio, LocalDateTime fin);
    List<FacturaCertificada> findByNitEmisorAndEstadoCertificacion(String nitEmisor, String estadoCertificacion);
}
