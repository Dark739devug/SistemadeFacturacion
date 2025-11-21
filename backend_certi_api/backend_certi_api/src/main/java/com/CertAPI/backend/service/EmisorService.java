package com.CertAPI.backend.service;

import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.repository.EmisorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmisorService {

    private final EmisorRepository emisorRepository;

    @Transactional
    public Emisor registrarEmisor(Emisor emisor) {
        Optional<Emisor> existente = emisorRepository.findByNitEmisor(emisor.getNitEmisor());
        if (existente.isPresent()) {
            throw new IllegalArgumentException("El emisor con NIT " + emisor.getNitEmisor() + " ya está registrado");
        }
        emisor.setActivo(true);
        return emisorRepository.save(emisor);
    }

    public Optional<Emisor> obtenerEmisorPorNit(String nit) {
        return emisorRepository.findByNitEmisor(nit);
    }

    public Emisor obtenerEmisorActivo(String nit) {
        return emisorRepository.findByNitEmisor(nit)
                .filter(Emisor::getActivo)
                .orElseThrow(() -> new IllegalStateException(
                        "El emisor no está registrado o no está activo: " + nit));
    }

    public List<Emisor> listarTodos() {
        return emisorRepository.findAll();
    }

    @Transactional
    public Emisor actualizarEmisor(String nit, Emisor datosActualizados) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado: " + nit));

        emisor.setNombreComercial(datosActualizados.getNombreComercial());
        emisor.setCorreoEmisor(datosActualizados.getCorreoEmisor());

        if (datosActualizados.getFirmaElectronica() != null && !datosActualizados.getFirmaElectronica().isEmpty()) {
            emisor.setFirmaElectronica(datosActualizados.getFirmaElectronica());
        }
        emisor.setActivo(datosActualizados.getActivo());

        return emisorRepository.save(emisor);
    }

    @Transactional
    public void eliminarEmisor(String nit) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado: " + nit));

        try {
            emisorRepository.delete(emisor);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("No se puede eliminar al emisor " + nit + " porque tiene facturas/historial fiscal. Por favor, use la opción de DESACTIVAR.");
        } catch (Exception e) {
            throw new RuntimeException("Error inesperado al eliminar: " + e.getMessage());
        }
    }

    @Transactional
    public Emisor cambiarEstadoActivo(String nit, boolean activo) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado con NIT: " + nit));

        emisor.setActivo(activo);
        return emisorRepository.save(emisor);
    }
}