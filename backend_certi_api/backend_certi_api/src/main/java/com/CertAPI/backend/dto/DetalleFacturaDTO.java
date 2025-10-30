package com.CertAPI.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleFacturaDTO {
    
    @NotNull(message = "El número de línea es requerido")
    @Min(value = 1, message = "El número de línea debe ser mayor a 0")
    private Integer linea;
    
    @NotBlank(message = "La descripción es requerida")
    @Size(max = 200, message = "La descripción no puede exceder 200 caracteres")
    private String descripcion;
    
    @NotNull(message = "La cantidad es requerida")
    @DecimalMin(value = "0.0", inclusive = false, message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;
    
    @NotNull(message = "El precio unitario es requerido")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio unitario debe ser mayor a 0")
    private BigDecimal precioUnitario;
    
    private BigDecimal descuento = BigDecimal.ZERO;
    
    @NotNull(message = "El subtotal es requerido")
    @DecimalMin(value = "0.0", message = "El subtotal debe ser mayor o igual a 0")
    private BigDecimal subtotal;
    
    @Size(max = 50, message = "El código de producto no puede exceder 50 caracteres")
    private String codigoProducto;
    
    @Size(max = 20, message = "La unidad de medida no puede exceder 20 caracteres")
    private String unidadMedida;
}
