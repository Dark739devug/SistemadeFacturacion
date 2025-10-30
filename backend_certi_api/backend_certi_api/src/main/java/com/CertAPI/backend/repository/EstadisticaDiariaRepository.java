package com.CertAPI.backend.repository;

import com.CertAPI.backend.model.EstadisticaDiaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstadisticaDiariaRepository extends JpaRepository<EstadisticaDiaria, Long> {
    Optional<EstadisticaDiaria> findByFechaEstadisticaAndIdEstablecimientoCert(
            LocalDate fechaEstadistica, Long idEstablecimientoCert);
    List<EstadisticaDiaria> findByFechaEstadistica(LocalDate fechaEstadistica);
    List<EstadisticaDiaria> findByIdEstablecimientoCert(Long idEstablecimientoCert);
    List<EstadisticaDiaria> findByFechaEstadisticaBetween(LocalDate inicio, LocalDate fin);
}
