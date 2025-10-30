package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.Anulacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnulacionRepository extends JpaRepository<Anulacion, Long> {
    Optional<Anulacion> findByNumeroAutorizacion(String numeroAutorizacion);
    List<Anulacion> findByIdFacturaCert(Long idFacturaCert);
    List<Anulacion> findByEstadoAnulacion(String estadoAnulacion);
    List<Anulacion> findByUsuarioAnulacion(String usuarioAnulacion);
}
