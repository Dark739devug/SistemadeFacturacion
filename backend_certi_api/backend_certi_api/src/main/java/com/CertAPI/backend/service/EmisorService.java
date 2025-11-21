package com.CertAPI.backend.service;

import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.repository.EmisorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmisorService {

    private final EmisorRepository emisorRepository;

    // ================== CREATE ==================
    public Emisor registrarEmisor(Emisor emisor) {
        // Validar que no exista ya un emisor con ese NIT
        Optional<Emisor> existente = emisorRepository.findByNitEmisor(emisor.getNitEmisor());
        if (existente.isPresent()) {
            throw new IllegalArgumentException("El emisor con NIT " + emisor.getNitEmisor() + " ya está registrado");
        }
        // Por defecto activo al registrar
        emisor.setActivo(true);
        return emisorRepository.save(emisor);
    }

    // ================== READ ==================
    public Optional<Emisor> obtenerEmisorPorNit(String nit) {
        return emisorRepository.findByNitEmisor(nit);
    }

    // Método usado internamente para validar antes de certificar
    public Emisor obtenerEmisorActivo(String nit) {
        return emisorRepository.findByNitEmisor(nit)
                .filter(Emisor::getActivo)
                .orElseThrow(() -> new IllegalStateException(
                        "El emisor no está registrado o no está activo: " + nit));
    }

    public List<Emisor> listarTodos() {
        return emisorRepository.findAll();
    }

    // ================== UPDATE ==================
    public Emisor actualizarEmisor(String nit, Emisor datosActualizados) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado: " + nit));

        // Actualizamos solo los campos permitidos
        emisor.setNombreComercial(datosActualizados.getNombreComercial());
        emisor.setCorreoEmisor(datosActualizados.getCorreoEmisor());
        // Solo actualizamos la firma si viene una nueva
        if (datosActualizados.getFirmaElectronica() != null && !datosActualizados.getFirmaElectronica().isEmpty()) {
            emisor.setFirmaElectronica(datosActualizados.getFirmaElectronica());
        }
        emisor.setActivo(datosActualizados.getActivo());

        return emisorRepository.save(emisor);
    }

    // ================== DELETE ==================
    public void eliminarEmisor(String nit) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado: " + nit));
        emisorRepository.delete(emisor);
    }

    // ================== ACTIVAR/DESACTIVAR ==================
    public Emisor cambiarEstadoActivo(String nit, boolean activo) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado: " + nit));
        emisor.setActivo(activo);
        return emisorRepository.save(emisor);
    }
}