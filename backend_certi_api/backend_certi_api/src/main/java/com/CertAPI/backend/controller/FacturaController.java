package com.CertAPI.backend.controller;

import com.CertAPI.backend.dto.FacturaRequestDTO;
import com.CertAPI.backend.dto.FacturaResponseDTO;
import com.CertAPI.backend.service.FacturaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Facturas", description = "Gestión de facturas y ciclo de certificación")
public class FacturaController {

    private final FacturaService facturaService;

    // ================== CREAR ==================
    @PostMapping
    @Operation(summary = "Crear factura", description = "Crea una nueva factura en el sistema con estado PENDIENTE")
    public ResponseEntity<FacturaResponseDTO> crearFactura(@Valid @RequestBody FacturaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.crearFactura(request));
    }

    // ================== OBTENER POR ID ==================
    @GetMapping("/{id}")
    @Operation(summary = "Obtener factura", description = "Obtiene los detalles de una factura por ID")
    public ResponseEntity<FacturaResponseDTO> obtenerFactura(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.obtenerFactura(id));
    }

    // ================== LISTAR (TODAS) ==================
    @GetMapping
    @Operation(summary = "Listar facturas", description = "Lista todas las facturas del usuario actual")
    public ResponseEntity<List<FacturaResponseDTO>> listarFacturas() {
        return ResponseEntity.ok(facturaService.listarFacturas());
    }

    // ================== LISTAR (POR ESTADO) ==================
    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar por estado", description = "Filtra: PENDIENTE, CERTIFICADA, ANULADA")
    public ResponseEntity<List<FacturaResponseDTO>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(facturaService.listarFacturasPorEstado(estado));
    }

    // ================== CERTIFICAR (IMPORTANTE) ==================
    @PostMapping("/{id}/certificar")
    @Operation(summary = "Certificar factura", description = "Envía la factura al servicio FEL seleccionando el emisor mediante su NIT")
    public ResponseEntity<FacturaResponseDTO> certificarFactura(
            @Parameter(description = "ID de la factura") @PathVariable Long id,
            @Parameter(description = "NIT del emisor seleccionado") @RequestParam String nitEmisor) {

        // Aquí pasamos ambos parámetros al servicio que acabas de arreglar
        return ResponseEntity.ok(facturaService.certificarFactura(id, nitEmisor));
    }

    // ================== ELIMINAR ==================
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar factura", description = "Elimina lógicamente una factura (solo si no está certificada)")
    public ResponseEntity<Void> eliminarFactura(@PathVariable Long id) {
        facturaService.eliminarFactura(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}")
    @Operation(summary = "Actualizar factura", description = "Actualiza una factura existente")
    public ResponseEntity<FacturaResponseDTO> actualizarFactura(
            @PathVariable Long id,
            @Valid @RequestBody FacturaRequestDTO request) {
        // Nota: Necesitas implementar actualizarFactura en el servicio si no existe,
        // o usar crearFactura si manejas upsert, pero lo ideal es tener el método.
        // Por ahora, para que no de 500, retornamos un error controlado o implementamos simple:
        return ResponseEntity.badRequest().body(null); // Placeholder hasta implementar servicio
    }
}