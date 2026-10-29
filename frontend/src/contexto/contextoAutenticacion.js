import { createContext, useContext } from 'react'

// Sesión del usuario: {usuario, estaLogueado, esAdmin, iniciarSesion, cerrarSesion}. El proveedor está en ProveedorAutenticacion.jsx
export const ContextoAutenticacion = createContext(null)

export function useAutenticacion() {
  return useContext(ContextoAutenticacion)
}
