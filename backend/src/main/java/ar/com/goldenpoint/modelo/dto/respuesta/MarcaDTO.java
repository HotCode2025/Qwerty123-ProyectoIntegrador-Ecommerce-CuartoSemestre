package ar.com.goldenpoint.modelo.dto.respuesta;

/** Marca con la cantidad de productos que la usan (si es mayor a 0 no se puede borrar). */
public record MarcaDTO(Long id, String nombre, long cantidadProductos) {
}
