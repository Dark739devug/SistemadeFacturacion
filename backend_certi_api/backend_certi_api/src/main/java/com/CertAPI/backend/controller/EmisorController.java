package com.CertAPI.backend.controller;

import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.service.EmisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emisores")
@RequiredArgsConstructor
@Tag(name = "Gestión de Emisores", description = "Endpoints para registrar y configurar emisores")
@SecurityRequirement(name = "bearer-jwt")
public class EmisorController {

    private final EmisorService emisorService;

    // ================== CREATE ==================
    @PostMapping("/registrar")
    @Operation(summary = "Registrar nuevo emisor")
    public ResponseEntity<?> registrarEmisor(@Valid @RequestBody Emisor emisor) {
        try {
            Emisor nuevoEmisor = emisorService.registrarEmisor(emisor);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEmisor);
        } catch (Exception e) {
            // Captura si el NIT ya existe
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== READ ==================
    @GetMapping("/{nit}")
    @Operation(summary = "Obtener emisor por NIT")
    public ResponseEntity<Emisor> obtenerEmisor(
            @Parameter(description = "NIT del emisor sin guiones") @PathVariable String nit) {
        return emisorService.obtenerEmisorPorNit(nit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Listar todos los emisores")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<List<Emisor>> listarTodos() {
        return ResponseEntity.ok(emisorService.listarTodos());
    }

    // ================== UPDATE ==================
    @PutMapping("/{nit}")
    @Operation(summary = "Actualizar emisor")
    public ResponseEntity<?> actualizarEmisor(
            @PathVariable String nit,
            @Valid @RequestBody Emisor datos) {
        try {
            return ResponseEntity.ok(emisorService.actualizarEmisor(nit, datos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== DELETE (ARREGLADO) ==================
    @DeleteMapping("/{nit}")
    @Operation(summary = "Eliminar emisor")
    public ResponseEntity<?> eliminarEmisor(@PathVariable String nit) {
        try {
            // Si esto falla (por facturas asociadas), el servicio lanza excepción
            emisorService.eliminarEmisor(nit);
            return ResponseEntity.ok("Emisor eliminado correctamente");
        } catch (Exception e) {
            // ¡AQUÍ ATRAPAMOS EL ERROR!
            // Devolvemos 400 (Bad Request) con el mensaje "No se puede eliminar..."
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== ACTIVAR/DESACTIVAR (ARREGLADO) ==================
    @PatchMapping("/{nit}/activo")
    @Operation(summary = "Cambiar estado activo")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String nit,
            @Parameter(description = "true para activar, false para desactivar") @RequestParam boolean activo) {
        try {
            return ResponseEntity.ok(emisorService.cambiarEstadoActivo(nit, activo));
        } catch (Exception e) {
            // Si el NIT no existe, devolvemos el error claro
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}