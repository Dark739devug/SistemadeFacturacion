package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.SerieAutorizada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerieAutorizadaRepository extends JpaRepository<SerieAutorizada, Long> {
    List<SerieAutorizada> findByIdEstablecimientoCert(Long idEstablecimientoCert);
    Optional<SerieAutorizada> findByIdEstablecimientoCertAndSerieAndTipoDocumentoAndActivaTrue(
            Long idEstablecimientoCert, String serie, String tipoDocumento);
    List<SerieAutorizada> findByActivaTrue();
}
