package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Ajustes que el administrador guarda desde el panel. Un costo de envío en 0 significa envío siempre gratis. */
public record AjustesTiendaSolicitudDTO(
        @NotNull(message = "El costo de envío es obligatorio")
        @DecimalMin(value = "0", message = "El costo de envío no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El costo de envío no es válido")
        BigDecimal costoEnvio,

        @NotNull(message = "El monto para el envío gratis es obligatorio")
        @DecimalMin(value = "0", message = "El monto para el envío gratis no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El monto para el envío gratis no es válido")
        BigDecimal envioGratisDesde,

        @NotNull(message = "El recargo de personalización es obligatorio")
        @DecimalMin(value = "0", message = "El recargo de personalización no puede ser negativo")
        @Digits(integer = 10, fraction = 2, message = "El recargo de personalización no es válido")
        BigDecimal recargoPersonalizacion
) {
}
