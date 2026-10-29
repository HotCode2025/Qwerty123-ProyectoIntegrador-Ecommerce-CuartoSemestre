package ar.com.goldenpoint.configuracion;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Credenciales y URLs de Mercado Pago, definidas en application.yml (golden-point.mercadopago). */
@ConfigurationProperties(prefix = "golden-point.mercadopago")
public record PropiedadesMercadoPago(String accessToken, String claveWebhook, String urlNotificaciones, String urlFrontend) {
}

