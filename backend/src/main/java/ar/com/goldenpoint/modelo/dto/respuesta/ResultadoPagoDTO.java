package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;

/**
 * Resultado de confirmar un pago.
 * estadoPago es el estado en Mercado Pago (approved, rejected, pending, in_process…): viene así de su API.
 */
public record ResultadoPagoDTO(Long pedidoId, String estadoPago, EstadoPedido estadoPedido) {
}
