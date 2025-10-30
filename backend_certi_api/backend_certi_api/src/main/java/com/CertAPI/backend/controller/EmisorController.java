package com.CertAPI.backend.controller;

import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.service.EmisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emisores")
@RequiredArgsConstructor
public class EmisorController {

    private final EmisorService emisorService;

    // ================== CREATE ==================
    @PostMapping
    public ResponseEntity<?> registrarEmisor(@RequestBody Emisor emisor) {
        try {
            return ResponseEntity.ok(emisorService.registrarEmisor(emisor));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== READ ==================
    @GetMapping("/{nit}")
    public ResponseEntity<?> obtenerEmisor(@PathVariable String nit) {
        return emisorService.obtenerEmisorPorNit(nit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Emisor>> listarTodos() {
        return ResponseEntity.ok(emisorService.listarTodos());
    }

    // ================== UPDATE ==================
    @PutMapping("/{nit}")
    public ResponseEntity<?> actualizarEmisor(@PathVariable String nit, @RequestBody Emisor datos) {
        try {
            return ResponseEntity.ok(emisorService.actualizarEmisor(nit, datos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== DELETE ==================
    @DeleteMapping("/{nit}")
    public ResponseEntity<?> eliminarEmisor(@PathVariable String nit) {
        try {
            emisorService.eliminarEmisor(nit);
            return ResponseEntity.ok("Emisor eliminado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ================== ACTIVAR/DESACTIVAR ==================
    @PatchMapping("/{nit}/activo")
    public ResponseEntity<?> cambiarEstado(@PathVariable String nit, @RequestParam boolean activo) {
        try {
            return ResponseEntity.ok(emisorService.cambiarEstadoActivo(nit, activo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
