package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Dirección de envío que carga el cliente al finalizar la compra. */
public record DireccionEnvioDTO(
        @NotBlank(message = "La calle y el número son obligatorios")
        @Size(max = 150, message = "La dirección puede tener hasta 150 caracteres")
        String calle,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(max = 80, message = "La ciudad puede tener hasta 80 caracteres")
        String ciudad,

        @NotBlank(message = "La provincia es obligatoria")
        @Size(max = 60, message = "La provincia puede tener hasta 60 caracteres")
        String provincia,

        // Acepta el código postal de 4 dígitos (5600) y el CPA de 8 caracteres (M5600ABC)
        @NotBlank(message = "El código postal es obligatorio")
        @Pattern(regexp = "^[A-Za-z0-9]{4,10}$", message = "El código postal no es válido")
        String codigoPostal,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^[0-9 +()-]{6,30}$", message = "El teléfono no es válido")
        String telefono,

        @Size(max = 255, message = "Las indicaciones pueden tener hasta 255 caracteres")
        String indicaciones
) {
}
