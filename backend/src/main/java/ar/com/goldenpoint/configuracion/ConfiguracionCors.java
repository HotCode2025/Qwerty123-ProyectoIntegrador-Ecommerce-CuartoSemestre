package ar.com.goldenpoint.configuracion;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite que el frontend llame a la API desde otro dominio.
 * Solo se aceptan los orígenes configurados (no "*"), por ejemplo http://localhost:5173 o el dominio de Vercel.
 */
@Configuration
public class ConfiguracionCors implements WebMvcConfigurer {

    @Value("${golden-point.cors.origenes-permitidos}")
    private String[] origenesPermitidos;

    @Override
    public void addCorsMappings(CorsRegistry registro) {
        registro.addMapping("/api/**")
                .allowedOrigins(origenesPermitidos)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization");
    }
}
