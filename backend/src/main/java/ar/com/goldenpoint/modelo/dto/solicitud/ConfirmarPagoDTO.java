package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** ID del pago que devuelve Mercado Pago en la URL de regreso (payment_id). */
public record ConfirmarPagoDTO(
        @NotNull(message = "El pago es obligatorio")
        @Positive(message = "El pago no es válido")
        Long pagoId
) {
}
