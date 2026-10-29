package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos para crear una cuenta de cliente. */
public record RegistroSolicitudDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre puede tener hasta 60 caracteres")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 60, message = "El apellido puede tener hasta 60 caracteres")
        String apellido,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        @Size(max = 120, message = "El email puede tener hasta 120 caracteres")
        String email,

        // 72 es el máximo que procesa BCrypt
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String contrasena,

        @Size(max = 30, message = "El teléfono puede tener hasta 30 caracteres")
        String telefono
) {
}
