package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CrearPedidoDTO;
import ar.com.goldenpoint.modelo.enumeracion.Rol;
import ar.com.goldenpoint.servicio.IPedidoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Pedidos")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoControlador {

    private final IPedidoServicio pedidoServicio;

    @Operation(summary = "Crea un pedido pendiente de pago con los ítems del carrito y la dirección de envío")
    @PostMapping
    public ResponseEntity<PedidoDetalleDTO> crear(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CrearPedidoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoServicio.crear(usuarioId(jwt), dto));
    }

    @Operation(summary = "Historial de pedidos del usuario logueado")
    @GetMapping("/mios")
    public ResponseEntity<List<PedidoResumenDTO>> listarMios(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(pedidoServicio.listarMios(usuarioId(jwt)));
    }

    @Operation(summary = "Detalle de un pedido (solo el dueño o un administrador)")
    @GetMapping("/{id}")
    public ResponseEntity<PedidoDetalleDTO> buscarPorId(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        boolean esAdmin = Rol.ADMIN.name().equals(jwt.getClaimAsString("rol"));
        return ResponseEntity.ok(pedidoServicio.buscarPorId(id, usuarioId(jwt), esAdmin));
    }

    // El usuario siempre sale del token, nunca de la URL ni del body
    private Long usuarioId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
