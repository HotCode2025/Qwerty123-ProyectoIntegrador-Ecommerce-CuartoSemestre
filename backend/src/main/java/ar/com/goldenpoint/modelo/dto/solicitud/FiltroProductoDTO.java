package ar.com.goldenpoint.modelo.dto.solicitud;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Filtros del catálogo que llegan como parámetros de la URL.
 * Todos son opcionales y se pueden combinar entre sí.
 */
public record FiltroProductoDTO(
        Deporte deporte,
        Long categoriaId,
        Long marcaId,
        Long talleId, // solo productos con stock en ese talle

        @PositiveOrZero(message = "El precio mínimo no puede ser negativo")
        BigDecimal precioMinimo,

        @PositiveOrZero(message = "El precio máximo no puede ser negativo")
        BigDecimal precioMaximo,

        @Size(max = 60, message = "La búsqueda puede tener hasta 60 caracteres")
        String busqueda,

        Boolean destacado,
        Boolean enOferta, // true = solo productos en oferta
        String orden, // recientes, precio_asc, precio_desc o nombre

        @Min(value = 0, message = "La página no puede ser negativa")
        Integer pagina,

        @Min(value = 1, message = "El tamaño de página debe ser entre 1 y 48")
        @Max(value = 48, message = "El tamaño de página debe ser entre 1 y 48")
        Integer tamanioPagina
) {

    public int paginaOPorDefecto() {
        return pagina == null ? 0 : pagina;
    }

    public int tamanioPaginaOPorDefecto() {
        return tamanioPagina == null ? 12 : tamanioPagina;
    }
}
