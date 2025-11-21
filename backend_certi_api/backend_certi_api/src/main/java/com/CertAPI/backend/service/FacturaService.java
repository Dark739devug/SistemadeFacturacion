package com.CertAPI.backend.service;

import com.CertAPI.backend.dto.DTERequestDTO;
import com.CertAPI.backend.dto.DTEResponseDTO;
import com.CertAPI.backend.dto.DetalleFacturaDTO;
import com.CertAPI.backend.dto.FacturaRequestDTO;
import com.CertAPI.backend.dto.FacturaResponseDTO;
import com.CertAPI.backend.exception.BadRequestException;
import com.CertAPI.backend.exception.ResourceNotFoundException;
import com.CertAPI.backend.model.DetalleFactura;
import com.CertAPI.backend.model.Emisor;
import com.CertAPI.backend.model.Factura;
import com.CertAPI.backend.model.Usuario;
import com.CertAPI.backend.repository.DetalleFacturaRepository;
import com.CertAPI.backend.repository.FacturaRepository;
import com.CertAPI.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final DetalleFacturaRepository detalleFacturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CertificacionService certificacionService;
    private final EmisorService emisorService;

    // ================== CREACIÓN ==================
    @Transactional
    public FacturaResponseDTO crearFactura(FacturaRequestDTO request) {
        Usuario usuario = obtenerUsuarioActual(); // <--- OJO: Si esto falla, da 500

        if (facturaRepository.existsByNumeroFactura(request.getNumeroFactura())) {
            throw new BadRequestException("El número de factura ya existe");
        }

        Factura factura = Factura.builder()
                .numeroFactura(request.getNumeroFactura())
                .serie(request.getSerie())
                .usuario(usuario)
                .nombreCliente(request.getNombreCliente())
                .nitCliente(request.getNitCliente())
                .direccionCliente(request.getDireccionCliente())
                .fechaEmision(LocalDateTime.now())
                .subtotal(request.getSubtotal())
                .iva(request.getIva())
                .total(request.getTotal())
                .estadoCertificacion("PENDIENTE")
                .activo(true)
                .build();

        factura = facturaRepository.save(factura);

        for (DetalleFacturaDTO detalleDTO : request.getDetalles()) {
            DetalleFactura detalle = DetalleFactura.builder()
                    .factura(factura)
                    .linea(detalleDTO.getLinea())
                    .descripcion(detalleDTO.getDescripcion())
                    .cantidad(detalleDTO.getCantidad())
                    .precioUnitario(detalleDTO.getPrecioUnitario())
                    .descuento(detalleDTO.getDescuento())
                    .subtotal(detalleDTO.getSubtotal())
                    .codigoProducto(detalleDTO.getCodigoProducto())
                    .unidadMedida(detalleDTO.getUnidadMedida())
                    .build();
            detalleFacturaRepository.save(detalle);
        }
        return convertirADTO(factura);
    }

    @Transactional(readOnly = true)
    public FacturaResponseDTO obtenerFactura(Long id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada"));
        return convertirADTO(factura);
    }

    @Transactional(readOnly = true)
    public List<FacturaResponseDTO> listarFacturas() {
        Usuario usuario = obtenerUsuarioActual();
        List<Factura> facturas = facturaRepository.findByUsuarioAndActivoTrue(usuario);
        return facturas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacturaResponseDTO> listarFacturasPorEstado(String estado) {
        Usuario usuario = obtenerUsuarioActual();
        List<Factura> facturas = facturaRepository.findByUsuarioAndEstado(usuario, estado);
        return facturas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    // ================== CERTIFICACIÓN (DEBUG MODE) ==================
    @Transactional
    public FacturaResponseDTO certificarFactura(Long id, String nitEmisor) {
        System.out.println("--- INICIANDO CERTIFICACIÓN DEBUG ---");
        System.out.println("ID Factura: " + id);
        System.out.println("NIT Emisor Recibido: " + nitEmisor);

        try {
            // 1. Buscar factura
            Factura factura = facturaRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada en BD"));

            if (!"PENDIENTE".equals(factura.getEstadoCertificacion())) {
                throw new BadRequestException("La factura ya fue procesada. Estado: " + factura.getEstadoCertificacion());
            }

            // 2. Validar Emisor
            if (nitEmisor == null || nitEmisor.isEmpty()) {
                throw new BadRequestException("El NIT del emisor llegó vacío al servicio.");
            }

            Emisor emisor = emisorService.obtenerEmisorPorNit(nitEmisor)
                    .filter(Emisor::getActivo)
                    .orElseThrow(() -> new BadRequestException("Emisor no encontrado o inactivo: " + nitEmisor));

            // 3. Validar datos clave antes de construir XML (Evitar NullPointer)
            if (factura.getFechaEmision() == null) throw new BadRequestException("La factura no tiene fecha de emisión.");
            if (factura.getNombreCliente() == null) throw new BadRequestException("El nombre del cliente es nulo.");
            if (factura.getTotal() == null) throw new BadRequestException("El total de la factura es nulo.");

            // 4. Construir XML
            System.out.println("Construyendo XML...");
            String xml = construirXmlDinamico(factura, emisor);
            System.out.println("XML Generado: " + xml);

            // 5. Llamar a Certificación
            DTERequestDTO request = new DTERequestDTO();
            request.setNitEmisor(emisor.getNitEmisor());
            request.setXmlDTE(xml);

            System.out.println("Enviando a CertificacionService...");
            DTEResponseDTO response = certificacionService.certificarDTE(request);
            System.out.println("Respuesta UUID: " + response.getUuid());

            // 6. Guardar cambios
            factura.setUuidFel(response.getUuid());
            factura.setNumeroAutorizacion(response.getNumeroAutorizacion());
            factura.setFechaCertificacion(response.getFechaCertificacion());
            factura.setXmlCertificado(response.getXmlCertificado());
            factura.setEstadoCertificacion("CERTIFICADA");

            factura = facturaRepository.save(factura);
            return convertirADTO(factura);

        } catch (Exception e) {
            // ¡AQUÍ ESTÁ LA CLAVE! Imprimimos el error real
            e.printStackTrace();
            // Y se lo mandamos al frontend
            throw new RuntimeException("ERROR FATAL en Certificación: " + e.getMessage());
        }
    }

    @Transactional
    public void eliminarFactura(Long id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada"));
        if ("CERTIFICADA".equals(factura.getEstadoCertificacion())) {
            throw new BadRequestException("No se puede eliminar una factura certificada");
        }
        factura.setActivo(false);
        facturaRepository.save(factura);
    }

    // ================== UTILIDADES ==================

    private Usuario obtenerUsuarioActual() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                // Para pruebas locales, si no hay usuario, retorna un usuario por defecto si existe
                // return usuarioRepository.findById(1L).orElseThrow(); // Descomenta si quieres probar sin login
                throw new BadRequestException("Usuario no autenticado en el contexto de seguridad");
            }
            String username = authentication.getName();
            return usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado en BD: " + username));
        } catch (Exception e) {
            System.err.println("Error obteniendo usuario: " + e.getMessage());
            throw e;
        }
    }

    private FacturaResponseDTO convertirADTO(Factura factura) {
        List<DetalleFacturaDTO> detallesDTO = detalleFacturaRepository.findByFactura(factura)
                .stream()
                .map(d -> new DetalleFacturaDTO(
                        d.getLinea(), d.getDescripcion(), d.getCantidad(), d.getPrecioUnitario(),
                        d.getDescuento(), d.getSubtotal(), d.getCodigoProducto(), d.getUnidadMedida()))
                .collect(Collectors.toList());

        return FacturaResponseDTO.builder()
                .idFactura(factura.getIdFactura())
                .numeroFactura(factura.getNumeroFactura())
                .serie(factura.getSerie())
                .nombreCliente(factura.getNombreCliente())
                .nitCliente(factura.getNitCliente())
                .direccionCliente(factura.getDireccionCliente())
                .fechaEmision(factura.getFechaEmision())
                .subtotal(factura.getSubtotal())
                .iva(factura.getIva())
                .total(factura.getTotal())
                .estadoCertificacion(factura.getEstadoCertificacion())
                .uuidFel(factura.getUuidFel())
                .numeroAutorizacion(factura.getNumeroAutorizacion())
                .fechaCertificacion(factura.getFechaCertificacion())
                .usuarioCreador(factura.getUsuario() != null ? factura.getUsuario().getUsername() : "N/A")
                .fechaCreacion(factura.getFechaCreacion())
                .detalles(detallesDTO)
                .build();
    }

    private String construirXmlDinamico(Factura factura, Emisor emisor) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        // Validación de seguridad
        String nitCli = (factura.getNitCliente() != null && !factura.getNitCliente().isEmpty())
                ? factura.getNitCliente() : "CF";

        return String.format(
                "<gte:GTDocumento xmlns:gte=\"http://www.sat.gob.gt/dte/fel/0.2.0\" Version=\"0.1\">" +
                        "<gte:SAT ClaseDocumento=\"dte\">" +
                        "<gte:DTE ID=\"DatosCertificados\">" +
                        "<gte:DatosEmision ID=\"DatosEmision\">" +
                        "<gte:DatosGenerales Tipo=\"FACT\" FechaHoraEmision=\"%s\" CodigoMoneda=\"GTQ\"/>" +
                        "<gte:Emisor NITEmisor=\"%s\" NombreEmisor=\"%s\" CodigoEstablecimiento=\"1\" AfiliacionIVA=\"GEN\"/>" +
                        "<gte:Receptor IDReceptor=\"%s\" NombreReceptor=\"%s\"/>" +
                        "<gte:Totales><gte:GranTotal>%s</gte:GranTotal></gte:Totales>" +
                        "</gte:DatosEmision></gte:DTE></gte:SAT></gte:GTDocumento>",
                factura.getFechaEmision().format(formatter),
                emisor.getNitEmisor(),
                emisor.getNombreComercial(),
                nitCli,
                factura.getNombreCliente(),
                factura.getTotal()
        );
    }
}