package ar.com.goldenpoint.configuracion;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos generales que muestra Swagger UI en /swagger-ui.html.
 * El esquema "bearerAuth" agrega el botón Authorize para probar las rutas protegidas con un token.
 */
@Configuration
public class ConfiguracionOpenApi {

    @Bean
    public OpenAPI documentacionApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Golden Point API")
                        .description("API REST del e-commerce Golden Point: catálogo, carrito, pedidos y administración.")
                        .version("v1"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
