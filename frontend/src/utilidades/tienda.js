import { formatearPrecio } from "./formato";

// Personalización de camisetas: mismas reglas que valida el backend
export const MAXIMO_NOMBRE_PERSONALIZADO = 12;

/** Pasa a mayúsculas y deja solo letras y espacios, hasta 12 caracteres. */
export function limpiarNombrePersonalizado(texto) {
  return texto
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÑÜ ]/g, "")
    .slice(0, MAXIMO_NOMBRE_PERSONALIZADO);
}

/** Deja solo un número del 1 al 99 (o vacío). */
export function limpiarNumeroPersonalizado(texto) {
  const digitos = texto.replace(/\D/g, "").slice(0, 2);
  const numero = parseInt(digitos, 10);
  return digitos === "" || numero < 1 ? "" : String(numero);
}

/** "Envío gratis desde $100.000", o que siempre es gratis si el costo o el mínimo están en 0. */
export function textoEnvioGratis(ajustes) {
  if (
    Number(ajustes.costoEnvio) === 0 ||
    Number(ajustes.envioGratisDesde) === 0
  ) {
    return "Envío gratis en todas las compras";
  }
  return `Envío gratis desde ${formatearPrecio(ajustes.envioGratisDesde)}`;
}

/** Precio que paga el cliente: el de oferta si el producto tiene uno. */
export function precioVigente(producto) {
  return producto.precioOferta ?? producto.precio;
}

/** 100 → 80 da 20 (por ciento de descuento, redondeado). */
export function porcentajeDescuento(precio, precioOferta) {
  return Math.round((1 - Number(precioOferta) / Number(precio)) * 100);
}
