package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;

/** Categoría con la cantidad de productos que la usan (si es mayor a 0 no se puede borrar). */
public record CategoriaDTO(Long id, String nombre, TipoTalle tipoTalle, long cantidadProductos) {
}
