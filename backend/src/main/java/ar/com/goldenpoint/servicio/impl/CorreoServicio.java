package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.configuracion.PropiedadesCorreo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

/**
 * Envía mails transaccionales con la API de Brevo.
 * Nunca lanza excepciones: si el envío falla lo registra en el log y devuelve false,
 * así un problema con el correo no rompe un pago ni otra operación.
 */
@Slf4j
@Service
public class CorreoServicio {

    private final PropiedadesCorreo correo;
    private final RestClient brevo;

    public CorreoServicio(PropiedadesCorreo correo) {
        this.correo = correo;
        this.brevo = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                // strip: al pegar la clave en el panel del deploy es fácil que se cuele un espacio o un salto de línea
                .defaultHeader("api-key", correo.brevoApiKey() == null ? "" : correo.brevoApiKey().strip())
                .build();
    }

    public boolean enviar(String emailDestino, String nombreDestino, String asunto, String html) {
        if (!correo.estaHabilitado()) {
            log.info("[MAIL sin enviar: falta configurar Brevo] Para: {} · Asunto: {}", emailDestino, asunto);
            return true;
        }
        // Los nombres de los campos ("sender", "to", "htmlContent"…) los define la API de Brevo
        Map<String, Object> cuerpo = Map.of(
                "sender", Map.of("name", correo.remitenteNombre(), "email", correo.remitenteEmail()),
                "to", List.of(Map.of("email", emailDestino, "name", nombreDestino == null ? emailDestino : nombreDestino)),
                "subject", asunto,
                "htmlContent", html);
        try {
            brevo.post().uri("/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cuerpo)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Mail enviado a {} · Asunto: {}", emailDestino, asunto);
            return true;
        } catch (RestClientException e) {
            log.error("No se pudo enviar el mail a {} ({}): {}", emailDestino, asunto, e.getMessage());
            return false;
        }
    }
}
