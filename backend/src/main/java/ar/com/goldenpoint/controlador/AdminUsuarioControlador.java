package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.UsuarioHabilitadoDTO;
import ar.com.goldenpoint.servicio.IAdminUsuarioServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Administración: usuarios")
@SecurityRequirement(name = "bearerAuth")
@Validated
@RestController
@RequestMapping("/api/v1/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuarioControlador {

    private final IAdminUsuarioServicio adminUsuarioServicio;

    @Operation(summary = "Usuarios, con búsqueda opcional por nombre, apellido o email")
    @GetMapping
    public ResponseEntity<PaginaRespuestaDTO<UsuarioAdminDTO>> buscar(
            @RequestParam(required = false) @Size(max = 60, message = "La búsqueda puede tener hasta 60 caracteres") String busqueda,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "La página no puede ser negativa") int pagina,
            @RequestParam(defaultValue = "20") @Min(value = 1, message = "El tamaño de página debe ser entre 1 y 100")
            @Max(value = 100, message = "El tamaño de página debe ser entre 1 y 100") int tamanioPagina) {
        return ResponseEntity.ok(adminUsuarioServicio.buscar(busqueda, pagina, tamanioPagina));
    }

    @Operation(summary = "Habilita o deshabilita una cuenta de cliente (no se aplica a administradores)")
    @PatchMapping("/{id}/habilitado")
    public ResponseEntity<UsuarioAdminDTO> cambiarHabilitado(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                                             @Valid @RequestBody UsuarioHabilitadoDTO dto) {
        return ResponseEntity.ok(adminUsuarioServicio.cambiarHabilitado(id, dto.habilitado(), Long.valueOf(jwt.getSubject())));
    }
}
