import { ESTADOS_PEDIDO } from '../../utilidades/pedidos'
import estilos from './EtiquetaEstado.module.css'

/** Etiqueta de color con el estado de un pedido. */
function EtiquetaEstado({ estado }) {
  const info = ESTADOS_PEDIDO[estado] ?? { etiqueta: estado, color: 'var(--blanco)' }
  return (
    <span className={estilos.etiqueta} style={{ background: info.color }}>
      {info.etiqueta}
    </span>
  )
}

export default EtiquetaEstado
