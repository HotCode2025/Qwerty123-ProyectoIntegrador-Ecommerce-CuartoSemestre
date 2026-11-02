import { useCallback, useEffect, useMemo, useState } from 'react'
import { ContextoCarrito } from './contextoCarrito'

const CLAVE_CARRITO = 'gp_carrito'
const CANTIDAD_MAXIMA = 20 // mismo límite que valida el backend

// Cada línea: {productoId, talleId, cantidad, nombrePersonalizado, numeroPersonalizado}.
// Los precios no se guardan: los calcula /carrito/cotizacion
function leerCarritoGuardado() {
  try {
    const items = JSON.parse(localStorage.getItem(CLAVE_CARRITO))
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

// Dos líneas son la misma si coinciden producto, talle y personalización
const mismaLinea = (a, b) =>
  a.productoId === b.productoId &&
  a.talleId === b.talleId &&
  (a.nombrePersonalizado ?? null) === (b.nombrePersonalizado ?? null) &&
  (a.numeroPersonalizado ?? null) === (b.numeroPersonalizado ?? null)

export function ProveedorCarrito({ children }) {
  const [items, setItems] = useState(leerCarritoGuardado)

  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items))
  }, [items])

  const agregarItem = useCallback((linea) => {
    setItems((actuales) => {
      const existente = actuales.find((item) => mismaLinea(item, linea))
      if (!existente) {
        return [...actuales, linea]
      }
      return actuales.map((item) =>
        item === existente ? { ...item, cantidad: Math.min(CANTIDAD_MAXIMA, item.cantidad + linea.cantidad) } : item,
      )
    })
  }, [])

  const cambiarCantidad = useCallback((indice, cantidad) => {
    setItems((actuales) =>
      actuales.map((item, i) => (i === indice ? { ...item, cantidad: Math.max(1, Math.min(CANTIDAD_MAXIMA, cantidad)) } : item)),
    )
  }, [])

  const quitarItem = useCallback((indice) => {
    setItems((actuales) => actuales.filter((_, i) => i !== indice))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const valor = useMemo(
    () => ({
      items,
      cantidad: items.reduce((total, item) => total + item.cantidad, 0),
      agregarItem,
      cambiarCantidad,
      quitarItem,
      vaciar,
    }),
    [items, agregarItem, cambiarCantidad, quitarItem, vaciar],
  )

  return <ContextoCarrito.Provider value={valor}>{children}</ContextoCarrito.Provider>
}
