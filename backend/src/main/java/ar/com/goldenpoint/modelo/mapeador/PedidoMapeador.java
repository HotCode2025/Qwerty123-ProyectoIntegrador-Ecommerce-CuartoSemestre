package ar.com.goldenpoint.modelo.mapeador;

import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenAdminDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.DireccionEnvioDTO;
import ar.com.goldenpoint.modelo.entidad.ItemPedido;
import ar.com.goldenpoint.modelo.entidad.Pedido;
import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import ar.com.goldenpoint.servicio.impl.CalculadoraCarrito;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Arma la entidad Pedido a partir del carrito calculado y la convierte en sus DTOs. */
@Component
public class PedidoMapeador {

    public Pedido aEntidad(Usuario usuario, CalculadoraCarrito.Resultado carrito, DireccionEnvioDTO envio) {
        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .estado(EstadoPedido.PENDIENTE_PAGO)
                .subtotal(carrito.cotizacion().subtotal())
                .recargoPersonalizacion(carrito.cotizacion().recargoPersonalizacion())
                .costoEnvio(carrito.cotizacion().costoEnvio())
                .total(carrito.cotizacion().total())
                .envioCalle(envio.calle().trim())
                .envioCiudad(envio.ciudad().trim())
                .envioProvincia(envio.provincia().trim())
                .envioCodigoPostal(envio.codigoPostal().trim().toUpperCase())
                .envioTelefono(envio.telefono().trim())
                .envioIndicaciones(envio.indicaciones() == null || envio.indicaciones().isBlank() ? null : envio.indicaciones().trim())
                .build();
        carrito.lineas().forEach(linea -> pedido.getItems().add(ItemPedido.builder()
                .pedido(pedido)
                .producto(linea.producto())
                .talle(linea.talle())
                .cantidad(linea.cantidad())
                .precioUnitario(linea.precioUnitario())
                .recargoUnitario(linea.recargoUnitario())
                .nombrePersonalizado(linea.nombrePersonalizado())
                .numeroPersonalizado(linea.numeroPersonalizado())
                .build()));
        return pedido;
    }

    public PedidoDetalleDTO aDetalle(Pedido pedido) {
        return aDetalle(pedido, null);
    }

    public PedidoDetalleDTO aDetalle(Pedido pedido, String urlPago) {
        Usuario usuario = pedido.getUsuario();
        return new PedidoDetalleDTO(pedido.getId(), pedido.getEstado(), pedido.getFechaCreacion(),
                pedido.getItems().stream().map(this::aItem).toList(),
                pedido.getSubtotal(), pedido.getRecargoPersonalizacion(), pedido.getCostoEnvio(), pedido.getTotal(),
                new PedidoDetalleDTO.Envio(pedido.getEnvioCalle(), pedido.getEnvioCiudad(), pedido.getEnvioProvincia(),
                        pedido.getEnvioCodigoPostal(), pedido.getEnvioTelefono(), pedido.getEnvioIndicaciones()),
                new PedidoDetalleDTO.Cliente(usuario.getId(), usuario.getNombre(), usuario.getApellido(), usuario.getEmail()),
                pedido.getMpPagoId(),
                urlPago);
    }

    public PedidoResumenAdminDTO aResumenAdmin(Pedido pedido) {
        Usuario usuario = pedido.getUsuario();
        return new PedidoResumenAdminDTO(pedido.getId(), pedido.getEstado(), pedido.getFechaCreacion(), usuario.getId(),
                usuario.getNombre() + " " + usuario.getApellido(), usuario.getEmail(), cantidadItems(pedido), pedido.getTotal());
    }

    public PedidoResumenDTO aResumen(Pedido pedido) {
        return new PedidoResumenDTO(pedido.getId(), pedido.getEstado(), pedido.getFechaCreacion(), cantidadItems(pedido),
                pedido.getTotal());
    }

    private int cantidadItems(Pedido pedido) {
        return pedido.getItems().stream().mapToInt(ItemPedido::getCantidad).sum();
    }

    private PedidoDetalleDTO.Item aItem(ItemPedido item) {
        BigDecimal totalLinea = item.getPrecioUnitario().add(item.getRecargoUnitario())
                .multiply(BigDecimal.valueOf(item.getCantidad()));
        return new PedidoDetalleDTO.Item(item.getProducto().getId(), item.getProducto().getNombre(),
                item.getTalle().getEtiqueta(), item.getCantidad(), item.getPrecioUnitario(), item.getRecargoUnitario(),
                item.getNombrePersonalizado(), item.getNumeroPersonalizado(), totalLinea);
    }
}
