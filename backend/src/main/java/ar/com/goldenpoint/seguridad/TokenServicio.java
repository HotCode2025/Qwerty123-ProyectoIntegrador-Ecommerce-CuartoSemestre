package ar.com.goldenpoint.seguridad;

import ar.com.goldenpoint.modelo.entidad.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/** Genera los tokens JWT. La validación de cada token la hace Spring Security automáticamente. */
@Service
@RequiredArgsConstructor
public class TokenServicio {

    private final JwtEncoder codificadorJwt;

    @Value("${golden-point.jwt.horas-expiracion}")
    private long horasExpiracion;

    /** El "subject" del token es el id del usuario y el claim "rol" su rol. */
    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet datos = JwtClaimsSet.builder()
                .issuer("golden-point-api")
                .issuedAt(ahora)
                .expiresAt(ahora.plus(horasExpiracion, ChronoUnit.HOURS))
                .subject(String.valueOf(usuario.getId()))
                .claim("rol", usuario.getRol().name())
                .build();
        JwsHeader encabezado = JwsHeader.with(MacAlgorithm.HS256).build();
        return codificadorJwt.encode(JwtEncoderParameters.from(encabezado, datos)).getTokenValue();
    }
}
