import { createContext, useContext } from "react";

// Ajustes de la tienda: {ajustes, cambiarAjustes}. ajustes es null mientras carga. El proveedor está en ProveedorAjustes.jsx
export const ContextoAjustes = createContext(null);

export function useAjustesTienda() {
  return useContext(ContextoAjustes);
}
