package ar.com.goldenpoint.modelo.dto.respuesta;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

/**
 * Cotización del carrito calculada en el servidor.
 * Las líneas con {@code problema} (sin stock, producto dado de baja…) no suman al total
 * y {@code valida} queda en false hasta que el cliente las corrija.
 */
public record CotizacionCarritoDTO(
        List<Linea> items,
        BigDecimal subtotal,
        BigDecimal recargoPersonalizacion,
        BigDecimal costoEnvio,
        BigDecimal total,
        BigDecimal envioGratisDesde,
        BigDecimal faltanteEnvioGratis,
        boolean valida
) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Linea(
            Long productoId,
            Long talleId,
            String productoNombre,
            String talleEtiqueta,
            String imagenUrl,
            int cantidad,
            String nombrePersonalizado,
            Integer numeroPersonalizado,
            BigDecimal precioUnitario,
            BigDecimal precioSinOferta, // precio normal tachado; solo viene si el producto está en oferta
            BigDecimal recargoUnitario,
            BigDecimal totalLinea,
            String problema
    ) {
    }
}
