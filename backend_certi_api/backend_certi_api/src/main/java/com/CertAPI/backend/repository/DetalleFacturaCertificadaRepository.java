package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.DetalleFacturaCertificada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleFacturaCertificadaRepository extends JpaRepository<DetalleFacturaCertificada, Long> {
    List<DetalleFacturaCertificada> findByIdFacturaCert(Long idFacturaCert);
    List<DetalleFacturaCertificada> findByCodigoProducto(String codigoProducto);
}
