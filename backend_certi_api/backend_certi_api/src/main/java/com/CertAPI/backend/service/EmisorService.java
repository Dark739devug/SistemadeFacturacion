package com.CertAPI.backend.service;

import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.repository.EmisorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmisorService {

    private final EmisorRepository emisorRepository;

    // ================== CREATE ==================
    public Emisor registrarEmisor(Emisor emisor) {
        Optional<Emisor> existente = emisorRepository.findByNitEmisor(emisor.getNitEmisor());
        if (existente.isPresent()) {
            throw new IllegalArgumentException("El emisor con NIT " + emisor.getNitEmisor() + " ya está registrado");
        }
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

        emisor.setNombreComercial(datosActualizados.getNombreComercial());
        emisor.setCorreoEmisor(datosActualizados.getCorreoEmisor());

        // Solo actualizamos la firma si viene una nueva
        if (datosActualizados.getFirmaElectronica() != null && !datosActualizados.getFirmaElectronica().isEmpty()) {
            emisor.setFirmaElectronica(datosActualizados.getFirmaElectronica());
        }
        // Opcional: Si quieres permitir reactivar desde aquí
        emisor.setActivo(datosActualizados.getActivo());

        return emisorRepository.save(emisor);
    }

    // ================== DELETE (BLINDADO) ==================
    public void eliminarEmisor(String nit) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado: " + nit));

        try {
            // Intentamos el borrado físico
            emisorRepository.delete(emisor);
        } catch (DataIntegrityViolationException e) {
            // ¡AQUÍ ESTÁ LA MAGIA!
            // Si la base de datos dice "Error de llave foránea" (tiene facturas), atrapamos el error.

            // Opción A: Lanzas error explicativo (Recomendado)
            throw new IllegalArgumentException("No se puede eliminar al emisor " + nit + " porque tiene facturas/historial fiscal. Por favor, use la opción de DESACTIVAR.");

            // Opción B (Alternativa): Desactivarlo automáticamente en lugar de borrar (Si prefieres esto, descomenta abajo)
            /*
            emisor.setActivo(false);
            emisorRepository.save(emisor);
            throw new IllegalArgumentException("No se pudo borrar por historial fiscal, pero el emisor ha sido DESACTIVADO automáticamente.");
            */
        } catch (Exception e) {
            throw new RuntimeException("Error inesperado al eliminar: " + e.getMessage());
        }
    }

    // ================== ACTIVAR/DESACTIVAR ==================
    public Emisor cambiarEstadoActivo(String nit, boolean activo) {
        Emisor emisor = emisorRepository.findByNitEmisor(nit)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado con NIT: " + nit));

        emisor.setActivo(activo);
        return emisorRepository.save(emisor);
    }
}