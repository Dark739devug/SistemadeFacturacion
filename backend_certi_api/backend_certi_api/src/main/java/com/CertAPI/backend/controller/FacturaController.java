package com.CertAPI.backend.controller;

import com.CertAPI.backend.dto.FacturaRequestDTO;
import com.CertAPI.backend.dto.FacturaResponseDTO;
import com.CertAPI.backend.service.FacturaService;
import io.swagger.v3.oas.annotations.Operation;
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
@Tag(name = "Facturas", description = "Gestión de facturas electrónicas")
public class FacturaController {

    private final FacturaService facturaService;

    @PostMapping
    @Operation(summary = "Crear factura", description = "Crea una nueva factura en el sistema")
    public ResponseEntity<FacturaResponseDTO> crearFactura(@Valid @RequestBody FacturaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.crearFactura(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener factura", description = "Obtiene los detalles de una factura por ID")
    public ResponseEntity<FacturaResponseDTO> obtenerFactura(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.obtenerFactura(id));
    }

    @GetMapping
    @Operation(summary = "Listar facturas", description = "Lista todas las facturas del usuario actual")
    public ResponseEntity<List<FacturaResponseDTO>> listarFacturas() {
        return ResponseEntity.ok(facturaService.listarFacturas());
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar por estado", description = "Lista facturas filtradas por estado de certificación")
    public ResponseEntity<List<FacturaResponseDTO>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(facturaService.listarFacturasPorEstado(estado));
    }

    @PostMapping("/{id}/certificar")
    @Operation(summary = "Certificar factura", description = "Envía la factura al servicio FEL para certificación")
    public ResponseEntity<FacturaResponseDTO> certificarFactura(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.certificarFactura(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar factura", description = "Elimina lógicamente una factura (solo si no está certificada)")
    public ResponseEntity<Void> eliminarFactura(@PathVariable Long id) {
        facturaService.eliminarFactura(id);
        return ResponseEntity.noContent().build();
    }
}
