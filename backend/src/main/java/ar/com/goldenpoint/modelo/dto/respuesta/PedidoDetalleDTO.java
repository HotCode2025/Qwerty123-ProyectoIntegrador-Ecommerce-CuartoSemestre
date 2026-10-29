package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Detalle completo de un pedido, con los importes y la dirección guardados al comprar.
 * {@code urlPago} (link a Mercado Pago) solo viene en la respuesta al crear el pedido
 * y {@code mpPagoId} solo cuando el pedido ya se pagó.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PedidoDetalleDTO(
        Long id,
        EstadoPedido estado,
        LocalDateTime fechaCreacion,
        List<Item> items,
        BigDecimal subtotal,
        BigDecimal recargoPersonalizacion,
        BigDecimal costoEnvio,
        BigDecimal total,
        Envio envio,
        Cliente cliente,
        String mpPagoId,
        String urlPago
) {

    public record Item(
            Long productoId,
            String productoNombre,
            String talleEtiqueta,
            int cantidad,
            BigDecimal precioUnitario,
            BigDecimal recargoUnitario,
            String nombrePersonalizado,
            Integer numeroPersonalizado,
            BigDecimal totalLinea
    ) {
    }

    public record Envio(String calle, String ciudad, String provincia, String codigoPostal, String telefono,
                        String indicaciones) {
    }

    /** Quién hizo el pedido (lo usa el panel; el cliente ve sus propios datos). */
    public record Cliente(Long id, String nombre, String apellido, String email) {
    }
}
