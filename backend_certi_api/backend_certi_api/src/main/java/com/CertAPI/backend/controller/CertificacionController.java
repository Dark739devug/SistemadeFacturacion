package com.CertAPI.backend.controller;

import com.CertAPI.backend.dto.AnulacionRequestDTO;
import com.CertAPI.backend.dto.ConsultaDTEResponseDTO;
import com.CertAPI.backend.dto.DTERequestDTO;
import com.CertAPI.backend.dto.DTEResponseDTO;
import com.CertAPI.backend.service.CertificacionService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/certificacion")
@RequiredArgsConstructor
@Tag(name = "Certificación FEL", description = "API de certificación de documentos tributarios electrónicos")
@SecurityRequirement(name = "bearer-jwt") // Asegúrate que este nombre coincida con tu config de Swagger
public class CertificacionController {

    private final CertificacionService certificacionService;

    // ================== CERTIFICAR (RECIBE XML) ==================
    @PostMapping("/certificar")
    @Operation(summary = "Certificar DTE",
            description = "Recibe un DTE en XML (generado por la otra API), lo valida, firma y envía a la SAT")
    public ResponseEntity<DTEResponseDTO> certificarDTE(@Valid @RequestBody DTERequestDTO request) {
        // Llama al método principal que recibe el XML y el NIT
        DTEResponseDTO response = certificacionService.certificarDTE(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ================== ANULAR ==================
    @PostMapping("/anular")
    @Operation(summary = "Anular DTE",
            description = "Procesa una solicitud de anulación de un DTE previamente certificado")
    public ResponseEntity<DTEResponseDTO> anularDTE(@Valid @RequestBody AnulacionRequestDTO request) {
        DTEResponseDTO response = certificacionService.anularDTE(request);
        return ResponseEntity.ok(response);
    }

    // ================== CONSULTAS ==================
    @GetMapping("/consultar/{uuid}")
    @Operation(summary = "Consultar DTE por UUID",
            description = "Obtiene la información completa de un DTE certificado")
    public ResponseEntity<ConsultaDTEResponseDTO> consultarDTE(@PathVariable String uuid) {
        ConsultaDTEResponseDTO response = certificacionService.consultarDTE(uuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/emisor/{nitEmisor}")
    @Operation(summary = "Consultar DTEs por emisor",
            description = "Obtiene todos los DTEs emitidos por un contribuyente específico")
    // @PreAuthorize es opcional, depende si tienes Spring Security configurado
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<List<ConsultaDTEResponseDTO>> consultarDTEsPorEmisor(
            @PathVariable String nitEmisor) {
        List<ConsultaDTEResponseDTO> response = certificacionService.consultarDTEsPorEmisor(nitEmisor);
        return ResponseEntity.ok(response);
    }
}