package com.CertAPI.backend.service;

import com.CertAPI.backend.dto.DetalleFacturaDTO;
import com.CertAPI.backend.dto.FacturaRequestDTO;
import com.CertAPI.backend.dto.FacturaResponseDTO;
import com.CertAPI.backend.exception.BadRequestException;
import com.CertAPI.backend.exception.ResourceNotFoundException;
import com.CertAPI.backend.model.DetalleFactura;
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

    @Transactional
    public FacturaResponseDTO certificarFactura(Long id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada"));

        if (!"PENDIENTE".equals(factura.getEstadoCertificacion())) {
            throw new BadRequestException("La factura ya fue procesada");
        }

        // Llamar al servicio de certificación
        certificacionService.certificarFactura(factura);

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
}
