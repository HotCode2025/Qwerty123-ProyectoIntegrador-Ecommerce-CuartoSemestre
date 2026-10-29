/** 45000 → "$ 45.000" (pesos argentinos, sin decimales). */
export function formatearPrecio(valor) {
  return "$ " + Math.round(Number(valor)).toLocaleString("es-AR");
}
