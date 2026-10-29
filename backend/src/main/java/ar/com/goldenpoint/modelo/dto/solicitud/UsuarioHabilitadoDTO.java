package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.NotNull;

/** Habilita (true) o deshabilita (false) una cuenta. */
public record UsuarioHabilitadoDTO(
        @NotNull(message = "Indicá si la cuenta queda habilitada")
        Boolean habilitado
) {
}
