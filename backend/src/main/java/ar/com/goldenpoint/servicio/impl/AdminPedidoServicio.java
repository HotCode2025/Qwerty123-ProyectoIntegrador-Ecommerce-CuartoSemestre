package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenAdminDTO;
import ar.com.goldenpoint.modelo.entidad.Pedido;
import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import ar.com.goldenpoint.modelo.mapeador.PedidoMapeador;
import ar.com.goldenpoint.repositorio.PedidoRepositorio;
import ar.com.goldenpoint.servicio.IAdminPedidoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static ar.com.goldenpoint.modelo.enumeracion.EstadoPedido.*;

@Service
@RequiredArgsConstructor
public class AdminPedidoServicio implements IAdminPedidoServicio {

    /**
     * Cambios de estado permitidos desde el panel. PENDIENTE_PAGO → PAGADO solo lo hace Mercado Pago,
     * y un pedido pagado no se cancela acá porque la devolución del dinero queda fuera del alcance.
     */
    private static final Map<EstadoPedido, EstadoPedido> SIGUIENTE = Map.of(
            PAGADO, EN_PREPARACION,
            EN_PREPARACION, ENVIADO,
            ENVIADO, ENTREGADO);

    private final PedidoRepositorio pedidoRepositorio;
    private final PedidoMapeador pedidoMapeador;

    @Override
    @Transactional(readOnly = true)
    public PaginaRespuestaDTO<PedidoResumenAdminDTO> buscar(EstadoPedido estado, int pagina, int tamanioPagina) {
        PageRequest paginacion = PageRequest.of(pagina, tamanioPagina,
                Sort.by(Sort.Order.desc("fechaCreacion"), Sort.Order.desc("id")));
        Page<Pedido> pedidos = estado == null
                ? pedidoRepositorio.findAll(paginacion)
                : pedidoRepositorio.findByEstado(estado, paginacion);
        return PaginaRespuestaDTO.desde(pedidos.map(pedidoMapeador::aResumenAdmin));
    }

    @Override
    @Transactional
    public PedidoDetalleDTO cambiarEstado(Long id, EstadoPedido estado) {
        // Con bloqueo: así no se cruza con una confirmación de pago que llegue al mismo tiempo
        Pedido pedido = pedidoRepositorio.buscarParaActualizar(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
        boolean permitido = estado == SIGUIENTE.get(pedido.getEstado())
                || (pedido.getEstado() == PENDIENTE_PAGO && estado == CANCELADO);
        if (!permitido) {
            throw new ExcepcionNegocio("No se puede pasar un pedido de " + pedido.getEstado() + " a " + estado,
                    HttpStatus.CONFLICT);
        }
        pedido.setEstado(estado);
        return pedidoMapeador.aDetalle(pedido);
    }
}
