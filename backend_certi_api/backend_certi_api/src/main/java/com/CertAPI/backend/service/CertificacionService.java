package com.CertAPI.backend.service;

import com.CertAPI.backend.dto.AnulacionRequestDTO;
import com.CertAPI.backend.dto.ConsultaDTEResponseDTO;
import com.CertAPI.backend.dto.DTERequestDTO;
import com.CertAPI.backend.dto.DTEResponseDTO;
import com.CertAPI.backend.exception.CertificacionException;
import com.CertAPI.backend.exception.ResourceNotFoundException;
import com.CertAPI.backend.model.AnulacionDTE;
import com.CertAPI.backend.model.DTE;
import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.repository.AnulacionDTERepository;
import com.CertAPI.backend.repository.DTERepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CertificacionService {

    private final DTERepository dteRepository;
    private final AnulacionDTERepository anulacionRepository;
    private final FirmaElectronicaService firmaService;
    private final SATIntegrationService satService;
    private final EmisorService emisorService;

    public CertificacionService(DTERepository dteRepository,
                                AnulacionDTERepository anulacionRepository,
                                FirmaElectronicaService firmaService,
                                SATIntegrationService satService,
                                EmisorService emisorService) {
        this.dteRepository = dteRepository;
        this.anulacionRepository = anulacionRepository;
        this.firmaService = firmaService;
        this.satService = satService;
        this.emisorService = emisorService;
    }

    // ================== MÉTODOS PRINCIPALES ==================
    @Transactional
    public DTEResponseDTO certificarDTE(DTERequestDTO request) {
        try {
            // 1. Validar que el emisor exista y esté activo en nuestra BD
            Emisor emisor = emisorService.obtenerEmisorPorNit(request.getNitEmisor())
                    .filter(Emisor::getActivo)
                    .orElseThrow(() -> new CertificacionException("El emisor no está registrado o no está activo"));

            // 2. Parsear el XML entrante
            Document doc = parsearXML(request.getXmlDTE());
            validarEstructuraXML(doc);

            // 3. Validar Firma del Emisor (COMENTADO PARA PRUEBAS CON XML CRUDO)
            /* NOTA: En producción, el contribuyente envía el XML ya firmado.
             Para pruebas desde Swagger enviamos XML crudo, por eso saltamos este paso.

            if (!firmaService.verificarFirma(request.getXmlDTE())) {
                throw new CertificacionException("La firma electrónica del emisor no es válida");
            }
            */

            // 4. Extraer datos clave para la base de datos
            DTE dte = extraerDatosDTE(doc, request);

            // Sobreescribir datos del emisor con los de nuestra BD segura
            dte.setNombreEmisor(emisor.getNombreComercial());
            dte.setFirmaEmisor(emisor.getFirmaElectronica());

            dte.setEstado(DTE.EstadoDTE.VALIDANDO);
            dte.setFechaRecepcion(LocalDateTime.now());
            dte.setXmlOriginal(request.getXmlDTE());

            dte = dteRepository.save(dte);

            // 5. FIRMAR COMO CERTIFICADOR (Esto es lo importante)
            // Aquí tu API pone su sello digital sobre el XML
            String xmlCertificado = firmaService.firmarXML(request.getXmlDTE());
            dte.setXmlCertificado(xmlCertificado);
            dte.setFirmaCertificador(firmaService.generarHash(xmlCertificado));

            // 6. Generar Autorización (UUID)
            String numeroAutorizacion = generarNumeroAutorizacion(dte);
            dte.setNumeroAutorizacion(numeroAutorizacion);
            dte.setFechaCertificacion(LocalDateTime.now());
            dte.setEstado(DTE.EstadoDTE.CERTIFICADO);

            dte = dteRepository.save(dte);

            // 7. Intentar enviar a SAT (Simulado)
            try {
                String respuestaSAT = satService.enviarDTEaSAT(dte);
                dte.setRespuestaSAT(respuestaSAT);
                dte.setFechaEnvioSAT(LocalDateTime.now());
                dte.setEstado(DTE.EstadoDTE.ENVIADO_SAT);
                dteRepository.save(dte);
            } catch (Exception e) {
                // Si falla SAT, no detenemos la certificación local, solo hacemos log
                System.err.println("Advertencia: No se pudo enviar a SAT: " + e.getMessage());
            }

            // 8. Retornar respuesta exitosa
            return DTEResponseDTO.builder()
                    .uuid(dte.getUuid())
                    .numeroAutorizacion(dte.getNumeroAutorizacion())
                    .estado(dte.getEstado().toString())
                    .mensaje("DTE certificado exitosamente")
                    .fechaCertificacion(dte.getFechaCertificacion())
                    .xmlCertificado(dte.getXmlCertificado())
                    .firmaCertificador(dte.getFirmaCertificador())
                    .build();

        } catch (Exception e) {
            throw new CertificacionException("Error al certificar DTE: " + e.getMessage(), e);
        }
    }

    @Transactional
    public DTEResponseDTO anularDTE(AnulacionRequestDTO request) {
        try {
            DTE dte = dteRepository.findByNumeroAutorizacion(request.getNumeroAutorizacion())
                    .orElseThrow(() -> new ResourceNotFoundException("DTE no encontrado"));

            if (dte.getEstado() != DTE.EstadoDTE.CERTIFICADO && dte.getEstado() != DTE.EstadoDTE.ENVIADO_SAT) {
                throw new CertificacionException("El DTE no está en estado válido para anulación");
            }

            AnulacionDTE anulacion = AnulacionDTE.builder()
                    .dte(dte)
                    .nitEmisor(request.getNitEmisor())
                    .numeroAutorizacion(request.getNumeroAutorizacion())
                    .fechaEmisionDocumento(dte.getFechaEmision())
                    .fechaAnulacion(LocalDateTime.now())
                    .motivo(request.getMotivo())
                    .estado(AnulacionDTE.EstadoAnulacion.SOLICITADA)
                    .build();

            anulacion = anulacionRepository.save(anulacion);

            try {
                String respuestaSAT = satService.enviarAnulacionaSAT(anulacion);
                anulacion.setRespuestaSAT(respuestaSAT);
                anulacion.setEstado(AnulacionDTE.EstadoAnulacion.APROBADA);
                anulacionRepository.save(anulacion);

                dte.setEstado(DTE.EstadoDTE.ANULADO);
                dteRepository.save(dte);

                return DTEResponseDTO.builder()
                        .uuid(dte.getUuid())
                        .numeroAutorizacion(dte.getNumeroAutorizacion())
                        .estado("ANULADO")
                        .mensaje("DTE anulado exitosamente")
                        .fechaCertificacion(LocalDateTime.now())
                        .build();

            } catch (Exception e) {
                anulacion.setEstado(AnulacionDTE.EstadoAnulacion.RECHAZADA);
                anulacion.setMotivoRechazo(e.getMessage());
                anulacionRepository.save(anulacion);
                throw new CertificacionException("Error al anular DTE en SAT: " + e.getMessage(), e);
            }

        } catch (Exception e) {
            throw new CertificacionException("Error al anular DTE: " + e.getMessage(), e);
        }
    }

    // ================== CONSULTAS ==================
    @Transactional(readOnly = true)
    public ConsultaDTEResponseDTO consultarDTE(String uuid) {
        DTE dte = dteRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("DTE no encontrado con UUID: " + uuid));

        return ConsultaDTEResponseDTO.builder()
                .uuid(dte.getUuid())
                .numeroAutorizacion(dte.getNumeroAutorizacion())
                .tipoDocumento(dte.getTipoDocumento())
                .nitEmisor(dte.getNitEmisor())
                .nombreEmisor(dte.getNombreEmisor())
                .nitReceptor(dte.getNitReceptor())
                .nombreReceptor(dte.getNombreReceptor())
                .fechaEmision(dte.getFechaEmision())
                .montoTotal(dte.getMontoTotal())
                .moneda(dte.getMoneda())
                .estado(dte.getEstado().toString())
                .fechaCertificacion(dte.getFechaCertificacion())
                .xmlCertificado(dte.getXmlCertificado())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ConsultaDTEResponseDTO> consultarDTEsPorEmisor(String nitEmisor) {
        List<DTE> dtes = dteRepository.findByNitEmisor(nitEmisor);

        return dtes.stream()
                .map(dte -> ConsultaDTEResponseDTO.builder()
                        .uuid(dte.getUuid())
                        .numeroAutorizacion(dte.getNumeroAutorizacion())
                        .tipoDocumento(dte.getTipoDocumento())
                        .nitEmisor(dte.getNitEmisor())
                        .nombreEmisor(dte.getNombreEmisor())
                        .nitReceptor(dte.getNitReceptor())
                        .nombreReceptor(dte.getNombreReceptor())
                        .fechaEmision(dte.getFechaEmision())
                        .montoTotal(dte.getMontoTotal())
                        .moneda(dte.getMoneda())
                        .estado(dte.getEstado().toString())
                        .fechaCertificacion(dte.getFechaCertificacion())
                        .build())
                .collect(Collectors.toList());
    }

    // ================== MÉTODOS AUXILIARES ==================
    private DTE extraerDatosDTE(Document doc, DTERequestDTO request) {
        DTE dte = new DTE();
        dte.setUuid(UUID.randomUUID().toString());
        dte.setNitEmisor(request.getNitEmisor());

        try {
            NodeList datosGenerales = doc.getElementsByTagName("gte:DatosGenerales");
            if (datosGenerales.getLength() > 0) {
                Element datos = (Element) datosGenerales.item(0);
                dte.setTipoDocumento(datos.getAttribute("Tipo"));

                String fechaStr = datos.getAttribute("FechaHoraEmision");
                if (fechaStr != null && !fechaStr.isEmpty()) {
                    // CORRECCIÓN CRÍTICA: Usamos ISO_DATE_TIME para soportar zona horaria (-06:00)
                    dte.setFechaEmision(LocalDateTime.parse(fechaStr, DateTimeFormatter.ISO_DATE_TIME));
                } else {
                    dte.setFechaEmision(LocalDateTime.now());
                }

                String moneda = datos.getAttribute("CodigoMoneda");
                dte.setMoneda(moneda != null && !moneda.isEmpty() ? moneda : "GTQ");
            }

            NodeList emisorNodes = doc.getElementsByTagName("gte:Emisor");
            if (emisorNodes.getLength() > 0) {
                Element emisorElem = (Element) emisorNodes.item(0);
                dte.setNombreEmisor(emisorElem.getAttribute("NombreEmisor"));
            }

            NodeList receptorNodes = doc.getElementsByTagName("gte:Receptor");
            if (receptorNodes.getLength() > 0) {
                Element receptor = (Element) receptorNodes.item(0);
                dte.setNitReceptor(receptor.getAttribute("IDReceptor"));
                dte.setNombreReceptor(receptor.getAttribute("NombreReceptor"));
            }

            NodeList totalNodes = doc.getElementsByTagName("gte:GranTotal");
            if (totalNodes.getLength() > 0) {
                String totalStr = totalNodes.item(0).getTextContent();
                dte.setMontoTotal(Double.parseDouble(totalStr));
            } else {
                dte.setMontoTotal(0.0);
            }

        } catch (Exception e) {
            // Valores por defecto si falla el parsing (Evita NullPointer)
            if (dte.getTipoDocumento() == null) dte.setTipoDocumento("FACT");
            if (dte.getNombreEmisor() == null) dte.setNombreEmisor("Emisor Desconocido");
            if (dte.getFechaEmision() == null) dte.setFechaEmision(LocalDateTime.now());
            if (dte.getMontoTotal() == null) dte.setMontoTotal(0.0);
            if (dte.getMoneda() == null) dte.setMoneda("GTQ");
        }

        return dte;
    }

    private Document parsearXML(String xml) throws Exception {
        return javax.xml.parsers.DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
                .parse(new ByteArrayInputStream(xml.getBytes()));
    }

    private void validarEstructuraXML(Document doc) throws CertificacionException {
        if (doc.getDocumentElement() == null) {
            throw new CertificacionException("XML no tiene elemento raíz");
        }
    }

    private String generarNumeroAutorizacion(DTE dte) {
        // Generamos un ID único para simular el de SAT
        return "AUT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}