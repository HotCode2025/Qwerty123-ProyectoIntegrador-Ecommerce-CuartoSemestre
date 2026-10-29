package ar.com.goldenpoint.seguridad;

import ar.com.goldenpoint.excepcion.ErrorApi;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

/**
 * Responde los errores de seguridad con el mismo formato {@link ErrorApi} que el resto de la API.
 * 401: falta el token o es inválido. 403: el usuario no tiene permiso.
 */
@Component
@RequiredArgsConstructor
public class ManejadorErroresSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper convertidorJson;

    @Override
    public void commence(HttpServletRequest solicitud, HttpServletResponse respuesta, AuthenticationException ex) throws IOException {
        escribir(respuesta, HttpStatus.UNAUTHORIZED, "Tenés que iniciar sesión para continuar");
    }

    @Override
    public void handle(HttpServletRequest solicitud, HttpServletResponse respuesta, AccessDeniedException ex) throws IOException {
        escribir(respuesta, HttpStatus.FORBIDDEN, "No tenés permiso para realizar esta acción");
    }

    private void escribir(HttpServletResponse respuesta, HttpStatus estado, String mensaje) throws IOException {
        respuesta.setStatus(estado.value());
        respuesta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        respuesta.setCharacterEncoding("UTF-8");
        convertidorJson.writeValue(respuesta.getOutputStream(), ErrorApi.de(estado.value(), mensaje));
    }
}
