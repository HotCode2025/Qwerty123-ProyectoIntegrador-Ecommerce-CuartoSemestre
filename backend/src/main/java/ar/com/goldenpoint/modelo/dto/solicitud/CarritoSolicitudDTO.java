package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Carrito que arma el navegador, para cotizarlo. */
public record CarritoSolicitudDTO(
        @NotEmpty(message = "El carrito está vacío")
        @Size(max = 50, message = "El carrito puede tener hasta 50 líneas")
        List<@Valid ItemCarritoDTO> items
) {
}
