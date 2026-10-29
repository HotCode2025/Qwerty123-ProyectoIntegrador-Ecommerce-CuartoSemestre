package ar.com.goldenpoint.modelo.dto.solicitud;

import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Datos para crear o editar una categoría. */
public record CategoriaSolicitudDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre puede tener hasta 60 caracteres")
        String nombre,

        @NotNull(message = "El tipo de talle es obligatorio")
        TipoTalle tipoTalle
) {
}