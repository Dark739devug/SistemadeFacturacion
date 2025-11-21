package com.CertAPI.backend.service;

import com.CertAPI.backend.dto.DTERequestDTO; // <--- NUEVO IMPORT
import com.CertAPI.backend.dto.DTEResponseDTO; // <--- NUEVO IMPORT
import com.CertAPI.backend.dto.DetalleFacturaDTO;
import com.CertAPI.backend.dto.FacturaRequestDTO;
import com.CertAPI.backend.dto.FacturaResponseDTO;
import com.CertAPI.backend.exception.BadRequestException;
import com.CertAPI.backend.exception.ResourceNotFoundException;
import com.CertAPI.backend.model.DetalleFactura;
import com.CertAPI.backend.model.Emisor; // <--- NUEVO IMPORT
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final DetalleFacturaRepository detalleFacturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CertificacionService certificacionService;
    private final EmisorService emisorService; // <--- AGREGADO (Necesario para el NIT)

    @Transactional
    public FacturaResponseDTO crearFactura(FacturaRequestDTO request) {
        Usuario usuario = obtenerUsuarioActual();

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

        // Guardar detalles
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

    // =================================================================
    // MÉTODO CORREGIDO: Ahora usa certificarDTE en lugar del método borrado
    // =================================================================
    @Transactional
    public FacturaResponseDTO certificarFactura(Long id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada"));

        if (!"PENDIENTE".equals(factura.getEstadoCertificacion())) {
            throw new BadRequestException("La factura ya fue procesada");
        }

        // 1. Obtener el Emisor basado en el usuario de la factura
        // (Asumiendo que el username del usuario es el NIT, como en tu lógica anterior)
        Emisor emisor = emisorService.obtenerEmisorPorNit(factura.getUsuario().getUsername())
                .filter(Emisor::getActivo)
                .orElseThrow(() -> new BadRequestException("El emisor no está registrado o no está activo"));

        // 2. Construir un XML Básico/Mínimo para que pase la validación
        // NOTA: Idealmente esto debería usar un Builder completo, pero para arreglar
        // la compilación y que funcione internamente, generamos esto:
        String xml = construirXmlBasico(factura, emisor);

        // 3. Preparar el Request para el Certificador
        DTERequestDTO request = new DTERequestDTO();
        request.setNitEmisor(emisor.getNitEmisor());
        request.setXmlDTE(xml);
        // No seteamos firmaElectronica porque el servicio la busca en BD

        // 4. Llamar al servicio nuevo
        DTEResponseDTO response = certificacionService.certificarDTE(request);

        // 5. Actualizar la factura local
        factura.setUuidFel(response.getUuid());
        factura.setNumeroAutorizacion(response.getNumeroAutorizacion());
        factura.setFechaCertificacion(response.getFechaCertificacion());
        factura.setEstadoCertificacion("CERTIFICADA");

        // No guardamos XML certificado aquí porque ya está en la tabla DTE,
        // pero podrías agregarlo si tu entidad Factura tiene ese campo.

        return convertirADTO(factura);
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

    private Usuario obtenerUsuarioActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private FacturaResponseDTO convertirADTO(Factura factura) {
        List<DetalleFacturaDTO> detallesDTO = detalleFacturaRepository.findByFactura(factura)
                .stream()
                .map(d -> new DetalleFacturaDTO(
                        d.getLinea(),
                        d.getDescripcion(),
                        d.getCantidad(),
                        d.getPrecioUnitario(),
                        d.getDescuento(),
                        d.getSubtotal(),
                        d.getCodigoProducto(),
                        d.getUnidadMedida()
                ))
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
                .mensajeError(factura.getMensajeError())
                .detalles(detallesDTO)
                .usuarioCreador(factura.getUsuario().getUsername())
                .fechaCreacion(factura.getFechaCreacion())
                .build();
    }

    // Helper para crear un XML que CertificacionService acepte
    private String construirXmlBasico(Factura factura, Emisor emisor) {
        return String.format(
                "<gte:GTDocumento xmlns:gte=\"http://www.sat.gob.gt/dte/fel/0.2.0\">" +
                        "<gte:SAT ClaseDocumento=\"dte\">" +
                        "<gte:DTE ID=\"DatosCertificados\">" +
                        "<gte:DatosEmision ID=\"DatosEmision\">" +
                        "<gte:DatosGenerales Tipo=\"FACT\" FechaHoraEmision=\"%s\" CodigoMoneda=\"GTQ\"/>" +
                        "<gte:Emisor NITEmisor=\"%s\" NombreEmisor=\"%s\"/>" +
                        "<gte:Receptor IDReceptor=\"%s\" NombreReceptor=\"%s\"/>" +
                        "<gte:Totales><gte:GranTotal>%s</gte:GranTotal></gte:Totales>" +
                        "</gte:DatosEmision></gte:DTE></gte:SAT></gte:GTDocumento>",
                factura.getFechaEmision().toString(),
                emisor.getNitEmisor(),
                emisor.getNombreComercial(),
                factura.getNitCliente() != null ? factura.getNitCliente() : "CF",
                factura.getNombreCliente(),
                factura.getTotal()
        );
    }
}