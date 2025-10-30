package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.TransaccionCertificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransaccionCertificacionRepository extends JpaRepository<TransaccionCertificacion, Long> {
    Optional<TransaccionCertificacion> findByUuidTransaccion(UUID uuidTransaccion);
    List<TransaccionCertificacion> findByIdEstablecimientoCert(Long idEstablecimientoCert);
    List<TransaccionCertificacion> findByNitEmisor(String nitEmisor);
    List<TransaccionCertificacion> findByFechaSolicitudBetween(LocalDateTime inicio, LocalDateTime fin);
    List<TransaccionCertificacion> findByExitosaTrue();
    List<TransaccionCertificacion> findByExitosaFalse();
}
