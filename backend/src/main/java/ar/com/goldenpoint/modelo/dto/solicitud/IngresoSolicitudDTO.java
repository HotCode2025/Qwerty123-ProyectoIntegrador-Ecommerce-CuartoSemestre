package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Datos para iniciar sesión. */
public record IngresoSolicitudDTO(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena
) {
}
