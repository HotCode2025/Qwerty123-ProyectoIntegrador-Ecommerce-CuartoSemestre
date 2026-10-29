package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Stock por talle a guardar. Los talles que no vienen en la lista no se modifican. */
public record ActualizarStockDTO(
        @NotEmpty(message = "Indicá al menos un talle")
        List<@Valid Linea> items
) {

    public record Linea(
            @NotNull(message = "El talle es obligatorio")
            Long talleId,

            @NotNull(message = "La cantidad es obligatoria")
            @Min(value = 0, message = "La cantidad no puede ser negativa")
            @Max(value = 9999, message = "La cantidad puede ser hasta 9999")
            Integer cantidad
    ) {
    }
}
