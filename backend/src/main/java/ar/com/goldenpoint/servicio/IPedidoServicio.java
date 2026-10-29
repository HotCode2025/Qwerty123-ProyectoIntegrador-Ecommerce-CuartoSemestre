package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CrearPedidoDTO;

import java.util.List;

public interface IPedidoServicio {

    PedidoDetalleDTO crear(Long usuarioId, CrearPedidoDTO dto);

    List<PedidoResumenDTO> listarMios(Long usuarioId);

    /** El dueño del pedido o un administrador pueden verlo; para cualquier otro "no existe". */
    PedidoDetalleDTO buscarPorId(Long pedidoId, Long usuarioId, boolean esAdmin);
}
