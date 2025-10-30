package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.DetalleFactura;
import com.CertAPI.backend.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleFacturaRepository extends JpaRepository<DetalleFactura, Long> {
    List<DetalleFactura> findByFactura(Factura factura);
    void deleteByFactura(Factura factura);
}
