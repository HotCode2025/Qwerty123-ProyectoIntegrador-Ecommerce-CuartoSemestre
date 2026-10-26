package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.AutenticacionRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.IngresoSolicitudDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.RegistroSolicitudDTO;
import ar.com.goldenpoint.servicio.IAutenticacionServicio;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Autenticación")
@RestController
@RequestMapping("/api/v1/autenticacion")
@RequiredArgsConstructor
public class AutenticacionControlador { // solo se comunica con la capa de servicio

    private final IAutenticacionServicio autenticacionServicio;

    @PostMapping("/registro")
    public ResponseEntity<AutenticacionRespuestaDTO> registrar(@Valid @RequestBody RegistroSolicitudDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(autenticacionServicio.registrar(dto));
    }

    @PostMapping("/ingreso")
    public ResponseEntity<AutenticacionRespuestaDTO> ingresar(@Valid @RequestBody IngresoSolicitudDTO dto) {
        return ResponseEntity.ok(autenticacionServicio.ingresar(dto));
    }

    // El id del usuario sale del token (claim "sub"), no de la URL, así nadie puede pedir datos de otro
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/perfil")
    public ResponseEntity<UsuarioRespuestaDTO> perfil(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(autenticacionServicio.obtenerUsuarioActual(Long.valueOf(jwt.getSubject())));
    }
}
