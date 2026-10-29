package ar.com.goldenpoint.excepcion;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Convierte cualquier excepción en un {@link ErrorApi}, para que el frontend
 * reciba siempre el mismo formato de error.
 */
@Slf4j
@RestControllerAdvice
public class ManejadorGlobalExcepciones extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ExcepcionNegocio.class)
    public ResponseEntity<ErrorApi> manejarNegocio(ExcepcionNegocio ex) {
        return ResponseEntity.status(ex.getEstado()).body(ErrorApi.de(ex.getEstado().value(), ex.getMessage()));
    }

    // Último recurso: se registra el detalle en el log y al cliente no se le exponen datos internos
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorApi> manejarInesperado(Exception ex) {
        log.error("Error inesperado", ex);
        HttpStatus estado = HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(estado).body(ErrorApi.de(estado.value(), "Ocurrió un error inesperado. Intentá de nuevo más tarde."));
    }

    // Errores de @Valid: devuelve el mensaje de cada campo inválido
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers,
                                                                  HttpStatusCode status, WebRequest request) {
        Map<String, String> errores = new LinkedHashMap<>();
        // Un error de conversión (por ejemplo, texto en un campo numérico) trae un mensaje técnico en inglés
        ex.getBindingResult().getFieldErrors().forEach(e ->
                errores.putIfAbsent(e.getField(), e.isBindingFailure() ? "Valor no válido" : e.getDefaultMessage()));
        return ResponseEntity.status(status).headers(headers).body(ErrorApi.de(status.value(), "Datos inválidos", errores));
    }

    // Resto de errores propios de Spring MVC (JSON mal formado, método no permitido, ruta inexistente…)
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
                                                             HttpStatusCode status, WebRequest request) {
        return ResponseEntity.status(status).headers(headers).body(ErrorApi.de(status.value(), mensajePara(status)));
    }

    private String mensajePara(HttpStatusCode estado) {
        return switch (estado.value()) {
            case 400 -> "La petición no es válida";
            case 404 -> "Recurso no encontrado";
            case 405 -> "Método no permitido";
            case 413 -> "El archivo supera el tamaño máximo de 3 MB";
            case 415 -> "Tipo de contenido no soportado";
            default -> "No se pudo procesar la petición";
        };
    }
}
