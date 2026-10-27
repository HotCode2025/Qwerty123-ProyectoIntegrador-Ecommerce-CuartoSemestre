package ar.com.goldenpoint.configuracion;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuración del envío de mails con Brevo, definida en application.yml (golden-point.correo). */
@ConfigurationProperties(prefix = "golden-point.correo")
public record PropiedadesCorreo(String brevoApiKey, String remitenteEmail, String remitenteNombre, String urlFrontend) {

    public boolean estaHabilitado() {
        return brevoApiKey != null && !brevoApiKey.isBlank() && remitenteEmail != null && !remitenteEmail.isBlank();
    }
}
