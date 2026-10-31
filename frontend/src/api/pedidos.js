import { llamarApi } from './cliente'

/** Cotiza el carrito en el servidor: precios, recargos, envío y problemas por línea. */
export function cotizarCarrito(items, senal) {
  return llamarApi('/carrito/cotizacion', { metodo: 'POST', cuerpo: { items }, senal })
}

/** Crea el pedido pendiente de pago. La respuesta trae urlPago (link a Mercado Pago). */
export function crearPedido(items, envio) {
  return llamarApi('/pedidos', { metodo: 'POST', cuerpo: { items, envio } })
}

/** Historial del usuario logueado, del más nuevo al más viejo. */
export function obtenerMisPedidos(senal) {
  return llamarApi('/pedidos/mios', { senal })
}

export function obtenerPedido(id, senal) {
  return llamarApi(`/pedidos/${id}`, { senal })
}

/** Confirma el pago con el payment_id que devuelve Mercado Pago. Devuelve {pedidoId, estadoPago, estadoPedido}. */
export function confirmarPago(pagoId, senal) {
  return llamarApi('/pagos/confirmar', { metodo: 'POST', cuerpo: { pagoId }, senal })
}
