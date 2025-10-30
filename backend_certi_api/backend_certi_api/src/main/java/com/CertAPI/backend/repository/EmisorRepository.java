package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.Emisor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmisorRepository extends JpaRepository<Emisor, Long> {
    Optional<Emisor> findByNitEmisor(String nitEmisor);
}
