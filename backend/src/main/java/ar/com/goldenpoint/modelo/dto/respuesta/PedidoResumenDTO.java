package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Resumen de un pedido para el historial "Mis pedidos". */
public record PedidoResumenDTO(Long id, EstadoPedido estado, LocalDateTime fechaCreacion, int cantidadItems,
                               BigDecimal total) {
}
