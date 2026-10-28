package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenAdminDTO;
import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;

public interface IAdminPedidoServicio {

    /** Pedidos de todos los clientes, del más nuevo al más viejo; estado null = todos. */
    PaginaRespuestaDTO<PedidoResumenAdminDTO> buscar(EstadoPedido estado, int pagina, int tamanioPagina);

    /** Avanza el pedido en el flujo permitido (o cancela uno pendiente de pago). */
    PedidoDetalleDTO cambiarEstado(Long id, EstadoPedido estado);
}
