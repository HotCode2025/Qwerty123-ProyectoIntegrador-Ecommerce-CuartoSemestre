package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CambioEstadoPedidoDTO;
import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import ar.com.goldenpoint.servicio.IAdminPedidoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

// El detalle de un pedido se ve con GET /api/v1/pedidos/{id}, que el administrador ya puede usar
@Tag(name = "Administración: pedidos")
@SecurityRequirement(name = "bearerAuth")
@Validated
@RestController
@RequestMapping("/api/v1/admin/pedidos")
@RequiredArgsConstructor
public class AdminPedidoControlador {

    private final IAdminPedidoServicio adminPedidoServicio;

    @Operation(summary = "Pedidos de todos los clientes, con filtro opcional por estado")
    @GetMapping
    public ResponseEntity<PaginaRespuestaDTO<PedidoResumenAdminDTO>> buscar(
            @RequestParam(required = false) EstadoPedido estado,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "La página no puede ser negativa") int pagina,
            @RequestParam(defaultValue = "20") @Min(value = 1, message = "El tamaño de página debe ser entre 1 y 100")
            @Max(value = 100, message = "El tamaño de página debe ser entre 1 y 100") int tamanioPagina) {
        return ResponseEntity.ok(adminPedidoServicio.buscar(estado, pagina, tamanioPagina));
    }

    @Operation(summary = "Cambia el estado: PAGADO → EN_PREPARACION → ENVIADO → ENTREGADO, o cancela un pedido pendiente de pago")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoDetalleDTO> cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambioEstadoPedidoDTO dto) {
        return ResponseEntity.ok(adminPedidoServicio.cambiarEstado(id, dto.estado()));
    }
}
