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
@Tag(name = "Gestión de Emisores", description = "Endpoints para registrar y configurar emisores (Sincronización con ERP)")
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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== READ ==================
    @GetMapping("/{nit}")
    public ResponseEntity<Emisor> obtenerEmisor(@PathVariable String nit) {
        return emisorService.obtenerEmisorPorNit(nit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<List<Emisor>> listarTodos() {
        return ResponseEntity.ok(emisorService.listarTodos());
    }

    // ================== UPDATE ==================
    @PutMapping("/{nit}")
    public ResponseEntity<?> actualizarEmisor(@PathVariable String nit, @Valid @RequestBody Emisor datos) {
        try {
            return ResponseEntity.ok(emisorService.actualizarEmisor(nit, datos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== DELETE (BLINDADO) ==================
    @DeleteMapping("/{nit}")
    public ResponseEntity<?> eliminarEmisor(@PathVariable String nit) {
        try {
            emisorService.eliminarEmisor(nit);
            return ResponseEntity.ok("Emisor eliminado correctamente");
        } catch (Exception e) {
            // Si falla (porque tiene facturas), devuelve un 400 Bad Request con el mensaje claro
            // Esto evita el Error 500 en el frontend
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== ACTIVAR/DESACTIVAR (ARREGLADO) ==================
    // Este es el que te daba 500. Ahora atrapa cualquier error.
    @PatchMapping("/{nit}/activo")
    @Operation(summary = "Cambiar estado activo", description = "Activa o desactiva la capacidad de firmar documentos")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String nit,
            @Parameter(description = "true para activar, false para desactivar") @RequestParam boolean activo) {
        try {
            return ResponseEntity.ok(emisorService.cambiarEstadoActivo(nit, activo));
        } catch (Exception e) {
            // Si el NIT no existe o hay otro problema, devolvemos el error legible
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}