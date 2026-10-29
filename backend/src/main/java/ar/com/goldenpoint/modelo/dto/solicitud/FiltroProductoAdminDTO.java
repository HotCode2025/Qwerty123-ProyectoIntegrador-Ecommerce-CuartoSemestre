package ar.com.goldenpoint.modelo.dto.solicitud;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/** Filtros del listado de productos del panel (incluye los dados de baja). */
public record FiltroProductoAdminDTO(
        @Size(max = 60, message = "La búsqueda puede tener hasta 60 caracteres")
        String busqueda,

        Boolean habilitado, // sin valor = todos

        @Min(value = 0, message = "La página no puede ser negativa")
        Integer pagina,

        @Min(value = 1, message = "El tamaño de página debe ser entre 1 y 100")
        @Max(value = 100, message = "El tamaño de página debe ser entre 1 y 100")
        Integer tamanioPagina
) {

    public int paginaOPorDefecto() {
        return pagina == null ? 0 : pagina;
    }

    public int tamanioPaginaOPorDefecto() {
        return tamanioPagina == null ? 20 : tamanioPagina;
    }
}
