package ar.com.goldenpoint.excepcion;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Formato único de error que devuelve la API.
 * {@code errores} solo aparece cuando hay errores de validación por campo.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorApi(int estado, String mensaje, Map<String, String> errores, LocalDateTime fecha) {

    public static ErrorApi de(int estado, String mensaje) {
        return new ErrorApi(estado, mensaje, null, LocalDateTime.now());
    }

    public static ErrorApi de(int estado, String mensaje, Map<String, String> errores) {
        return new ErrorApi(estado, mensaje, errores, LocalDateTime.now());
    }
}
