package com.CertAPI.backend.service;

import com.CertAPI.backend.model.AnulacionDTE;
import com.CertAPI.backend.model.DTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Servicio de integración SIMULADA con la SAT Guatemala
 * Para proyecto académico - NO se conecta realmente a la SAT
 * Simula las respuestas que daría la SAT en un ambiente real
 */
@Service
@Slf4j
public class SATIntegrationService {
    
    /**
     * Simula el envío de un DTE certificado a la SAT
     * En un ambiente real, esto se conectaría al API de la SAT
     * Para este proyecto académico, solo simula una respuesta exitosa
     */
    public String enviarDTEaSAT(DTE dte) {
        log.info("SIMULACIÓN: Enviando DTE a SAT: {}", dte.getNumeroAutorizacion());
        
        // Simular un pequeño delay como si estuviera procesando
        try {
            Thread.sleep(500); // 500ms de delay simulado
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        log.info("SIMULACIÓN: DTE recibido y validado correctamente por SAT");
        return generarRespuestaSATSimulada(dte);
    }
    
    /**
     * Simula el envío de una anulación de DTE a la SAT
     * Para proyecto académico - respuesta simulada
     */
    public String enviarAnulacionaSAT(AnulacionDTE anulacion) {
        log.info("SIMULACIÓN: Enviando anulación a SAT: {}", anulacion.getNumeroAutorizacion());
        
        // Simular un pequeño delay como si estuviera procesando
        try {
            Thread.sleep(500); // 500ms de delay simulado
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        log.info("SIMULACIÓN: Anulación procesada correctamente por SAT");
        return generarRespuestaAnulacionSimulada(anulacion);
    }
    
    /**
     * Genera una respuesta simulada de la SAT para un DTE certificado
     */
    private String generarRespuestaSATSimulada(DTE dte) {
        return String.format(
            "{\"resultado\":\"ACEPTADO\",\"numeroAutorizacion\":\"%s\",\"fechaRecepcion\":\"%s\",\"mensaje\":\"DTE recibido y validado correctamente por SAT (SIMULADO)\"}",
            dte.getNumeroAutorizacion(),
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }
    
    /**
     * Genera una respuesta simulada de la SAT para una anulación
     */
    private String generarRespuestaAnulacionSimulada(AnulacionDTE anulacion) {
        return String.format(
            "{\"resultado\":\"ACEPTADO\",\"numeroAutorizacion\":\"%s\",\"fechaAnulacion\":\"%s\",\"mensaje\":\"Anulación procesada correctamente por SAT (SIMULADO)\"}",
            anulacion.getNumeroAutorizacion(),
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }
}
