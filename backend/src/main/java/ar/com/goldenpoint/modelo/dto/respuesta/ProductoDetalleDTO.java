package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;

import java.math.BigDecimal;
import java.util.List;

/** Ficha completa de un producto, con la disponibilidad de cada talle. */
public record ProductoDetalleDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        BigDecimal precioOferta, // null si no está en oferta
        Deporte deporte,
        Long categoriaId,
        String categoriaNombre,
        Long marcaId,
        String marcaNombre,
        String imagenUrl,
        boolean personalizable,
        List<DisponibilidadTalle> talles
) {

    /** Solo indica si hay stock, sin mostrar la cantidad exacta. */
    public record DisponibilidadTalle(Long talleId, String etiqueta, boolean disponible) {
    }
}
