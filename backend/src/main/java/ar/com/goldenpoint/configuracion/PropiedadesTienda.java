package ar.com.goldenpoint.configuracion;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

/**
 * Valores comerciales iniciales de la tienda (application.yml, golden-point.tienda).
 * Se copian a la tabla ajustes_tienda la primera vez; después se cambian desde el panel (Ajustes).
 */
@ConfigurationProperties(prefix = "golden-point.tienda")
public record PropiedadesTienda(BigDecimal costoEnvio, BigDecimal envioGratisDesde, BigDecimal recargoPersonalizacion) {
}
