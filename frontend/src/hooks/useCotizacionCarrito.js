import { useEffect, useState } from 'react'
import { cotizarCarrito } from '../api/pedidos'

/**
 * Cotiza el carrito cada vez que cambia. Los precios siempre los calcula el backend.
 * Devuelve {cotizacion, cargando, error}; con el carrito vacío cotizacion es null.
 * (Los hooks de React tienen que empezar con "use": por eso el nombre mezcla idiomas.)
 */
export function useCotizacionCarrito(items) {
  const [respuesta, setRespuesta] = useState({ clave: null, cotizacion: null, error: '' })
  const clave = JSON.stringify(items)

  useEffect(() => {
    const itemsCarrito = JSON.parse(clave)
    if (itemsCarrito.length === 0) {
      return
    }
    const controlador = new AbortController()
    cotizarCarrito(itemsCarrito, controlador.signal)
      .then((cotizacion) => setRespuesta({ clave, cotizacion, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setRespuesta((anterior) => ({ clave, cotizacion: anterior.cotizacion, error: error.message }))
        }
      })
    return () => controlador.abort()
  }, [clave])

  if (items.length === 0) {
    return { cotizacion: null, cargando: false, error: '' }
  }
  const cargando = respuesta.clave !== clave
  return { cotizacion: respuesta.cotizacion, cargando, error: cargando ? '' : respuesta.error }
}
