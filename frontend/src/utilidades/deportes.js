// Deportes de la tienda: el valor del enum del backend, el nombre que ve el cliente y el slug de la URL (/catalogo?deporte=futbol)
export const DEPORTES = [
  { valor: 'FUTBOL', etiqueta: 'Fútbol', slug: 'futbol', color: 'var(--verde)', ilustracion: 'pelota', items: ['Camisetas', 'Botines', 'Pelotas'] },
  { valor: 'BASQUET', etiqueta: 'Básquet', slug: 'basquet', color: 'var(--naranja)', ilustracion: 'camiseta', items: ['Camisetas', 'Zapatillas', 'Pelotas'] },
  { valor: 'PADEL', etiqueta: 'Pádel', slug: 'padel', color: 'var(--celeste)', ilustracion: 'paleta', items: ['Paletas', 'Pelotas'] },
]

export function deportePorValor(valor) {
  return DEPORTES.find((deporte) => deporte.valor === valor)
}

export function deportePorSlug(slug) {
  return DEPORTES.find((deporte) => deporte.slug === slug)
}

// Ilustración que se muestra cuando el producto todavía no tiene foto
const ILUSTRACION_POR_CATEGORIA = { Camisetas: 'camiseta', Calzado: 'calzado', Pelotas: 'pelota', Paletas: 'paleta' }

export function tipoIlustracion(nombreCategoria) {
  return ILUSTRACION_POR_CATEGORIA[nombreCategoria] ?? 'pelota'
}

// Tipos de talle de las categorías (enum TipoTalle del backend)
export const TIPOS_TALLE = [
  { valor: 'ROPA', etiqueta: 'Ropa', rango: 'S a XXL', color: 'var(--hielo)' },
  { valor: 'CALZADO', etiqueta: 'Calzado', rango: '35 a 46', color: 'var(--menta)' },
  { valor: 'PELOTA', etiqueta: 'Pelotas', rango: 'N° 3 a 7', color: 'var(--crema)' },
  { valor: 'UNICO', etiqueta: 'Talle único', rango: 'Único', color: '#ededed' },
]

export function tipoTallePorValor(valor) {
  return TIPOS_TALLE.find((tipo) => tipo.valor === valor)
}

/**
 * Las pelotas tienen talles según el deporte (fútbol N° 3 a 5, básquet N° 6 y 7). opcionDeporte es un
 * elemento de filtros.deportes del backend, que trae esa lista; sin deporte, vale cualquier talle.
 */
export function talleCorrespondeAlDeporte(talle, opcionDeporte) {
  return talle.tipoTalle !== 'PELOTA' || !opcionDeporte || opcionDeporte.tallesPelota.includes(talle.etiqueta)
}
