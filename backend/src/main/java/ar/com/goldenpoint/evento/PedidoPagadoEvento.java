package ar.com.goldenpoint.evento;

/** Se publica cuando un pedido pasa a pagado. Dispara el mail de pedido confirmado. */
public record PedidoPagadoEvento(Long pedidoId) {
}
