import { ESTADOS_PEDIDO, PASOS_PEDIDO } from '../../utilidades/pedidos'
import estilos from './PasosPedido.module.css'

/** Línea de avance de un pedido pago: Pagado → En preparación → Enviado → Entregado. */
function PasosPedido({ estado }) {
  const actual = PASOS_PEDIDO.indexOf(estado)
  return (
    <ol className={estilos.pasos} aria-label="Avance del pedido">
      {PASOS_PEDIDO.map((paso, i) => {
        const hecho = i <= actual
        return (
          <li key={paso} className={hecho ? `${estilos.paso} ${estilos.hecho}` : estilos.paso} aria-current={i === actual ? 'step' : undefined}>
            <span className={estilos.punto} aria-hidden="true">
              {hecho ? '✓' : i + 1}
            </span>
            <span className={estilos.etiqueta}>{ESTADOS_PEDIDO[paso].etiqueta}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default PasosPedido
