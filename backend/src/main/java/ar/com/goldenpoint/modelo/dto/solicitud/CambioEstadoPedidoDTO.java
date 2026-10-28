package ar.com.goldenpoint.modelo.dto.solicitud;

import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import jakarta.validation.constraints.NotNull;

/** Nuevo estado de un pedido (solo se permiten los pasos válidos del flujo). */
public record CambioEstadoPedidoDTO(
        @NotNull(message = "El estado es obligatorio")
        EstadoPedido estado
) {
}
