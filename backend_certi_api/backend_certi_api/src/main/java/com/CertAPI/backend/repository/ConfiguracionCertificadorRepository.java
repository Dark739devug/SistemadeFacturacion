package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.ConfiguracionCertificador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionCertificadorRepository extends JpaRepository<ConfiguracionCertificador, Long> {
    Optional<ConfiguracionCertificador> findByClave(String clave);
}
