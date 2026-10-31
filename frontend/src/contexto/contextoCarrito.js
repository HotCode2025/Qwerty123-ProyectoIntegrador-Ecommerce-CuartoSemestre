import { createContext, useContext } from 'react'

// Carrito guardado en el navegador: {items, cantidad, agregarItem, cambiarCantidad, quitarItem, vaciar}. El proveedor está en ProveedorCarrito.jsx
export const ContextoCarrito = createContext(null)

export function useCarrito() {
  return useContext(ContextoCarrito)
}
