package com.CertAPI.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacturaRequestDTO {
    
    @NotBlank(message = "El número de factura es requerido")
    @Size(max = 100, message = "El número de factura no puede exceder 100 caracteres")
    private String numeroFactura;
    
    @NotBlank(message = "La serie es requerida")
    @Size(max = 100, message = "La serie no puede exceder 100 caracteres")
    private String serie;
    
    @NotBlank(message = "El nombre del cliente es requerido")
    @Size(max = 200, message = "El nombre del cliente no puede exceder 200 caracteres")
    private String nombreCliente;
    
    @NotBlank(message = "El NIT del cliente es requerido")
    @Size(max = 20, message = "El NIT no puede exceder 20 caracteres")
    private String nitCliente;
    
    @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
    private String direccionCliente;
    
    @NotNull(message = "El subtotal es requerido")
    @DecimalMin(value = "0.0", inclusive = false, message = "El subtotal debe ser mayor a 0")
    private BigDecimal subtotal;
    
    @NotNull(message = "El IVA es requerido")
    @DecimalMin(value = "0.0", message = "El IVA debe ser mayor o igual a 0")
    private BigDecimal iva;
    
    @NotNull(message = "El total es requerido")
    @DecimalMin(value = "0.0", inclusive = false, message = "El total debe ser mayor a 0")
    private BigDecimal total;
    
    @NotEmpty(message = "Debe incluir al menos un detalle")
    @Valid
    private List<DetalleFacturaDTO> detalles;
}
