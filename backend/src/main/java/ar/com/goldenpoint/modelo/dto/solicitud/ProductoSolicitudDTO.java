package ar.com.goldenpoint.modelo.dto.solicitud;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Datos para crear o editar un producto desde el panel. El stock y la foto se cargan aparte. */
public record ProductoSolicitudDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "El nombre puede tener hasta 120 caracteres")
        String nombre,

        @Size(max = 1000, message = "La descripción puede tener hasta 1000 caracteres")
        String descripcion,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "1", message = "El precio debe ser mayor a 0")
        @Digits(integer = 10, fraction = 2, message = "El precio no es válido")
        BigDecimal precio,

        // Vacío = sin oferta. Si viene, tiene que ser menor que el precio normal
        @DecimalMin(value = "1", message = "El precio de oferta debe ser mayor a 0")
        @Digits(integer = 10, fraction = 2, message = "El precio de oferta no es válido")
        BigDecimal precioOferta,

        @NotNull(message = "El deporte es obligatorio")
        Deporte deporte,

        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId,

        @NotNull(message = "La marca es obligatoria")
        Long marcaId,

        Boolean personalizable, // sin valor = false
        Boolean destacado,      // sin valor = false
        Boolean habilitado      // sin valor = true
) {
}
