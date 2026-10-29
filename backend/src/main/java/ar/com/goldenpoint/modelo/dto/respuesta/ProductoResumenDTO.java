package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;

import java.math.BigDecimal;

/** Datos de un producto para las tarjetas del catálogo. */
public record ProductoResumenDTO(
        Long id,
        String nombre,
        BigDecimal precio,
        BigDecimal precioOferta, // null si no está en oferta
        Deporte deporte,
        String categoriaNombre,
        String marcaNombre,
        String imagenUrl,
        boolean personalizable,
        boolean destacado,
        boolean conStock // true si tiene stock en al menos un talle
) {
}
