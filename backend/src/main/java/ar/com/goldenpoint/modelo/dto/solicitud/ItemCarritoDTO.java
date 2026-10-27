package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Una línea del carrito. El precio no viaja: siempre se toma de la base de datos.
 * La personalización (nombre y número) es opcional y solo vale para camisetas personalizables.
 */
public record ItemCarritoDTO(
        @NotNull(message = "El producto es obligatorio")
        Long productoId,

        @NotNull(message = "El talle es obligatorio")
        Long talleId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser entre 1 y 20")
        @Max(value = 20, message = "La cantidad debe ser entre 1 y 20")
        Integer cantidad,

        @Size(max = 12, message = "El nombre puede tener hasta 12 caracteres")
        String nombrePersonalizado,

        @Min(value = 1, message = "El número debe ser entre 1 y 99")
        @Max(value = 99, message = "El número debe ser entre 1 y 99")
        Integer numeroPersonalizado
) {
}
