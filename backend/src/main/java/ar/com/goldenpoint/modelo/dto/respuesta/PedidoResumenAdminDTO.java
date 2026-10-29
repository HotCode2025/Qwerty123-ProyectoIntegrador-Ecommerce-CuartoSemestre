package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Pedido en el listado del panel, con los datos del cliente. */
public record PedidoResumenAdminDTO(
        Long id,
        EstadoPedido estado,
        LocalDateTime fechaCreacion,
        Long clienteId,
        String clienteNombre,
        String clienteEmail,
        int cantidadItems,
        BigDecimal total
) {
}