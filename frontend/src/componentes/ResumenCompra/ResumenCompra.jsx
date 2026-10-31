import { formatearPrecio } from '../../utilidades/formato'
import estilos from './ResumenCompra.module.css'

/**
 * Caja amarilla con los importes de una cotización (carrito y finalizar compra).
 * children va entre el envío y el total (en el carrito, la barra de envío gratis); acciones va al final.
 */
function ResumenCompra({ titulo, cotizacion, cargando, children, acciones }) {
  return (
    <aside className={cargando ? `${estilos.resumen} ${estilos.cargando}` : estilos.resumen} aria-label="Resumen de compra" aria-busy={cargando}>
      <h2 className={`display ${estilos.titulo}`}>{titulo}</h2>
      {cotizacion && (
        <>
          <div className={estilos.fila}>
            <span>Subtotal</span>
            <strong>{formatearPrecio(cotizacion.subtotal)}</strong>
          </div>
          {Number(cotizacion.recargoPersonalizacion) > 0 && (
            <div className={estilos.fila}>
              <span>Personalización</span>
              <strong>{formatearPrecio(cotizacion.recargoPersonalizacion)}</strong>
            </div>
          )}
          <div className={estilos.fila}>
            <span>Envío a domicilio</span>
            <strong>{Number(cotizacion.costoEnvio) === 0 ? 'Gratis' : formatearPrecio(cotizacion.costoEnvio)}</strong>
          </div>
          {children}
          <div className={`${estilos.fila} ${estilos.filaTotal}`}>
            <span>Total</span>
            <span className={`display ${estilos.total}`}>{formatearPrecio(cotizacion.total)}</span>
          </div>
        </>
      )}
      {acciones}
    </aside>
  )
}

export default ResumenCompra
