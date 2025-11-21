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
    @Operation(summary = "Registrar nuevo emisor",
            description = "Recibe los datos fiscales y la firma electrónica para habilitar la certificación")
    public ResponseEntity<Emisor> registrarEmisor(@Valid @RequestBody Emisor emisor) {
        Emisor nuevoEmisor = emisorService.registrarEmisor(emisor);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEmisor);
    }

    // ================== READ ==================
    @GetMapping("/{nit}")
    @Operation(summary = "Obtener emisor por NIT", description = "Busca si un emisor existe y retorna sus datos")
    public ResponseEntity<Emisor> obtenerEmisor(
            @Parameter(description = "NIT del emisor sin guiones") @PathVariable String nit) {

        return emisorService.obtenerEmisorPorNit(nit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Listar todos los emisores", description = "Devuelve la lista completa de emisores registrados")
    // CORRECCIÓN AQUÍ: Cambiado de hasRole a hasAuthority('SCOPE_ADMIN') para que coincida con tu token JWT
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<List<Emisor>> listarTodos() {
        return ResponseEntity.ok(emisorService.listarTodos());
    }

    // ================== UPDATE ==================
    @PutMapping("/{nit}")
    @Operation(summary = "Actualizar emisor", description = "Actualiza datos de contacto o renueva la firma electrónica")
    public ResponseEntity<Emisor> actualizarEmisor(
            @PathVariable String nit,
            @Valid @RequestBody Emisor datos) {
        return ResponseEntity.ok(emisorService.actualizarEmisor(nit, datos));
    }

    // ================== DELETE ==================
    @DeleteMapping("/{nit}")
    @Operation(summary = "Eliminar emisor", description = "Elimina un emisor del sistema de certificación")
    public ResponseEntity<String> eliminarEmisor(@PathVariable String nit) {
        emisorService.eliminarEmisor(nit);
        return ResponseEntity.ok("Emisor eliminado correctamente");
    }

    // ================== ACTIVAR/DESACTIVAR ==================
    @PatchMapping("/{nit}/activo")
    @Operation(summary = "Cambiar estado activo", description = "Activa o desactiva la capacidad de firmar documentos")
    public ResponseEntity<Emisor> cambiarEstado(
            @PathVariable String nit,
            @Parameter(description = "true para activar, false para desactivar") @RequestParam boolean activo) {
        return ResponseEntity.ok(emisorService.cambiarEstadoActivo(nit, activo));
    }
}