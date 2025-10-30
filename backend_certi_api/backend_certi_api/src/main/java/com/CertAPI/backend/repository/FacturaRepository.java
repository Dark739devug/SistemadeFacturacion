package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.Factura;
import com.CertAPI.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
    Optional<Factura> findByNumeroFactura(String numeroFactura);
    List<Factura> findByUsuarioAndActivoTrue(Usuario usuario);
    List<Factura> findByEstadoCertificacion(String estado);
    List<Factura> findByFechaEmisionBetween(LocalDateTime inicio, LocalDateTime fin);
    
    @Query("SELECT f FROM Factura f WHERE f.usuario = :usuario AND f.estadoCertificacion = :estado AND f.activo = true")
    List<Factura> findByUsuarioAndEstado(@Param("usuario") Usuario usuario, @Param("estado") String estado);
    
    boolean existsByNumeroFactura(String numeroFactura);


}
