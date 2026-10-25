package ar.com.goldenpoint.configuracion;

import ar.com.goldenpoint.seguridad.ManejadorErroresSeguridad;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Seguridad de la API: sin sesiones, cada petición protegida debe traer un token JWT
 * en el header "Authorization: Bearer ...". El rol viaja dentro del token.
 */
@Configuration
@RequiredArgsConstructor
public class ConfiguracionSeguridad {

    private final ManejadorErroresSeguridad manejadorErrores;

    @Value("${golden-point.jwt.clave}")
    private String claveJwt;

    @Bean
    public SecurityFilterChain cadenaFiltros(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // no hace falta: no usamos cookies de sesión
                .cors(Customizer.withDefaults()) // toma la configuración de ConfiguracionCors
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/autenticacion/registro", "/api/v1/autenticacion/ingreso").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/**", "/api/v1/catalogo/**", "/api/v1/tienda/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/carrito/cotizacion", "/api/v1/avisos-stock", "/api/v1/pagos/webhook").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(rs -> rs
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(convertidorAutenticacion()))
                        .authenticationEntryPoint(manejadorErrores))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(manejadorErrores)
                        .accessDeniedHandler(manejadorErrores));
        return http.build();
    }

    @Bean
    public PasswordEncoder codificadorContrasenas() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtEncoder codificadorJwt() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(claveSecreta()));
    }

    @Bean
    public JwtDecoder decodificadorJwt() {
        return NimbusJwtDecoder.withSecretKey(claveSecreta()).macAlgorithm(MacAlgorithm.HS256).build();
    }

    // Lee el rol del claim "rol" y lo convierte en ROLE_ADMIN / ROLE_CLIENTE para hasRole()
    private JwtAuthenticationConverter convertidorAutenticacion() {
        JwtGrantedAuthoritiesConverter permisos = new JwtGrantedAuthoritiesConverter();
        permisos.setAuthoritiesClaimName("rol");
        permisos.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter convertidor = new JwtAuthenticationConverter();
        convertidor.setJwtGrantedAuthoritiesConverter(permisos);
        return convertidor;
    }

    private SecretKey claveSecreta() {
        byte[] bytes = claveJwt.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
}
