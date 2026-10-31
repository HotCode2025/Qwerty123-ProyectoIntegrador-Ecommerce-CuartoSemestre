import { aConsulta, llamarApi } from './cliente'

/** Lista paginada de productos. Filtros: deporte, categoriaId, marcaId, talleId, precioMinimo, precioMaximo, busqueda, destacado, orden, pagina, tamanioPagina. */
export function obtenerProductos(filtros = {}, senal) {
  return llamarApi(`/productos${aConsulta(filtros)}`, { senal })
}

/** Ficha de un producto con la disponibilidad de cada talle. */
export function obtenerProducto(id, senal) {
  return llamarApi(`/productos/${id}`, { senal })
}

/** Deportes, categorías, marcas, talles y rango de precios para armar los filtros. */
export function obtenerFiltrosCatalogo(senal) {
  return llamarApi('/catalogo/filtros', { senal })
}

/** "Avisarme cuando llegue" para un talle sin stock. Devuelve {mensaje}. */
export function crearAvisoStock(aviso) {
  return llamarApi('/avisos-stock', { metodo: 'POST', cuerpo: aviso })
}
