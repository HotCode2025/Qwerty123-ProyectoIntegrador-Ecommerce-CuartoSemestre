package ar.com.goldenpoint.modelo.enumeracion;

/** Estados por los que pasa un pedido. */
public enum EstadoPedido {
    PENDIENTE_PAGO,
    PAGADO,
    EN_PREPARACION,
    ENVIADO,
    ENTREGADO,
    CANCELADO
}
