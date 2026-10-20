import { llamarApi } from "./cliente";

/** Costo de envío, monto para el envío gratis y recargo de personalización que rigen hoy. */
export function obtenerAjustesTienda(senal) {
  return llamarApi("/tienda/ajustes", { senal });
}
