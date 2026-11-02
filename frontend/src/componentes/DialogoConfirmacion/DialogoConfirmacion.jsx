import { useEffect, useRef } from 'react'
import Icono from '../Icono/Icono'
import estilos from './DialogoConfirmacion.module.css'

/**
 * Cartel de confirmación sobre la pantalla (usa <dialog>, que ya maneja el foco y la tecla Escape).
 * children es el texto; acciones, los botones de abajo.
 */
function DialogoConfirmacion({ titulo, children, acciones, alCerrar, tono = 'peligro' }) {
  const referencia = useRef(null)

  useEffect(() => {
    const dialogo = referencia.current
    dialogo.showModal()
    return () => dialogo.close()
  }, [])

  return (
    <dialog
      ref={referencia}
      className={estilos.dialogo}
      aria-labelledby="titulo-confirmacion"
      onCancel={(evento) => {
        evento.preventDefault() // Escape: se cierra desde React para mantener el estado en orden
        alCerrar()
      }}
      onClick={(evento) => {
        if (evento.target === referencia.current) {
          alCerrar() // clic en el fondo oscuro
        }
      }}
    >
      <div className={estilos.caja}>
        <span className={tono === 'peligro' ? `${estilos.icono} ${estilos.peligro}` : estilos.icono} aria-hidden="true">
          <Icono nombre={tono === 'peligro' ? 'basura' : 'alerta'} tamanio={26} />
        </span>
        <h2 id="titulo-confirmacion" className={`display ${estilos.titulo}`}>
          {titulo}
        </h2>
        <div className={estilos.texto}>{children}</div>
        <div className={estilos.acciones}>{acciones}</div>
      </div>
    </dialog>
  )
}

export default DialogoConfirmacion
