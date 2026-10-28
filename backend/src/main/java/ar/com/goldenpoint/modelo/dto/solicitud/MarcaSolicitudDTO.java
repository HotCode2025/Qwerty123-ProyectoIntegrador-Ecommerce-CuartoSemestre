package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos para crear o renombrar una marca. */
public record MarcaSolicitudDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre puede tener hasta 60 caracteres")
        String nombre
) {
}
