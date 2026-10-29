package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Datos para crear un pedido: los ítems del carrito y la dirección de envío. */
public record CrearPedidoDTO(
        @NotEmpty(message = "El carrito está vacío")
        @Size(max = 50, message = "El carrito puede tener hasta 50 líneas")
        List<@Valid ItemCarritoDTO> items,

        @NotNull(message = "La dirección de envío es obligatoria")
        @Valid
        DireccionEnvioDTO envio
) {
}
