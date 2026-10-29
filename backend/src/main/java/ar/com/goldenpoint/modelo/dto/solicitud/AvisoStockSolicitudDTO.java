package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Pedido de "Avisarme cuando llegue" para un talle sin stock. No requiere cuenta. */
public record AvisoStockSolicitudDTO(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        @Size(max = 120, message = "El email puede tener hasta 120 caracteres")
        String email,

        @NotNull(message = "El producto es obligatorio")
        Long productoId,

        @NotNull(message = "El talle es obligatorio")
        Long talleId
) {
}
