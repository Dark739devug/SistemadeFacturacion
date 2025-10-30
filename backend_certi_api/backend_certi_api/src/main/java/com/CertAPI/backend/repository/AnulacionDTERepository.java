package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.AnulacionDTE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnulacionDTERepository extends JpaRepository<AnulacionDTE, Long> {
    
    List<AnulacionDTE> findByNitEmisor(String nitEmisor);
    
    Optional<AnulacionDTE> findByNumeroAutorizacion(String numeroAutorizacion);
    
    List<AnulacionDTE> findByEstado(AnulacionDTE.EstadoAnulacion estado);
}
