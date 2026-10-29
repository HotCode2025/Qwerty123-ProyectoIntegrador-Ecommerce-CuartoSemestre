import { useEffect, useMemo, useState } from "react";
import { obtenerAjustesTienda } from "../api/tienda";
import { ContextoAjustes } from "./contextoAjustes";

/**
 * Pide una sola vez los ajustes de la tienda (envío y recargo) para los textos de todas las pantallas.
 * Los importes que se cobran los calcula siempre el backend; esto es solo para mostrarlos.
 */
export function ProveedorAjustes({ children }) {
  const [ajustes, setAjustes] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();
    obtenerAjustesTienda(controlador.signal)
      .then(setAjustes)
      .catch(() => {}); // sin ajustes, las pantallas omiten esos textos
    return () => controlador.abort();
  }, []);

  // cambiarAjustes lo usa el panel al guardar, así la tienda se actualiza sin recargar
  const valor = useMemo(
    () => ({ ajustes, cambiarAjustes: setAjustes }),
    [ajustes],
  );

  return (
    <ContextoAjustes.Provider value={valor}>
      {children}
    </ContextoAjustes.Provider>
  );
}
