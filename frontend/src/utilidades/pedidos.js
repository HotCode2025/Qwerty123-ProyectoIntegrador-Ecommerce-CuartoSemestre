// Estados del pedido (enum EstadoPedido del backend) con el texto y el color que ve el cliente
export const ESTADOS_PEDIDO = {
  PENDIENTE_PAGO: { etiqueta: 'Pendiente de pago', color: 'var(--blanco)' },
  PAGADO: { etiqueta: 'Pagado', color: 'var(--verde)' },
  EN_PREPARACION: { etiqueta: 'En preparación', color: 'var(--amarillo)' },
  ENVIADO: { etiqueta: 'Enviado', color: 'var(--celeste)' },
  ENTREGADO: { etiqueta: 'Entregado', color: 'var(--verde)' },
  CANCELADO: { etiqueta: 'Cancelado', color: 'var(--error)' },
}

// Recorrido normal de un pedido pago, para la línea de avance del detalle
export const PASOS_PEDIDO = ['PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO']

/** "2026-10-16T15:18:02" → "16 de octubre de 2026". */
export function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}
