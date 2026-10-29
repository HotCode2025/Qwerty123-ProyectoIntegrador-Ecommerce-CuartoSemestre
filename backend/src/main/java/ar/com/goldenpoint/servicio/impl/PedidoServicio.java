package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.PedidoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CrearPedidoDTO;
import ar.com.goldenpoint.modelo.entidad.Pedido;
import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.mapeador.PedidoMapeador;
import ar.com.goldenpoint.repositorio.PedidoRepositorio;
import ar.com.goldenpoint.repositorio.UsuarioRepositorio;
import ar.com.goldenpoint.servicio.IPagoServicio;
import ar.com.goldenpoint.servicio.IPedidoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoServicio implements IPedidoServicio {

    private final PedidoRepositorio pedidoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final CalculadoraCarrito calculadoraCarrito;
    private final PedidoMapeador pedidoMapeador;
    private final IPagoServicio pagoServicio;

    /**
     * Crea el pedido en estado PENDIENTE_PAGO con los precios recalculados en el servidor
     * y genera su link de pago en Mercado Pago. Si Mercado Pago falla, el pedido no se guarda.
     * El stock no se descuenta acá: se descuenta cuando Mercado Pago confirma el pago.
     */
    @Override
    @Transactional
    public PedidoDetalleDTO crear(Long usuarioId, CrearPedidoDTO dto) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
        if (!usuario.isHabilitado()) {
            throw new ExcepcionNegocio("Tu cuenta está deshabilitada", HttpStatus.FORBIDDEN);
        }
        CalculadoraCarrito.Resultado carrito = calculadoraCarrito.calcular(dto.items());
        if (!carrito.cotizacion().valida()) {
            throw new ExcepcionNegocio("Revisá tu carrito: hay productos sin stock o que ya no están disponibles",
                    HttpStatus.CONFLICT);
        }
        Pedido pedido = pedidoRepositorio.save(pedidoMapeador.aEntidad(usuario, carrito, dto.envio()));
        String urlPago = pagoServicio.crearLinkPago(pedido);
        return pedidoMapeador.aDetalle(pedido, urlPago);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResumenDTO> listarMios(Long usuarioId) {
        return pedidoRepositorio.findByUsuarioIdOrderByFechaCreacionDescIdDesc(usuarioId).stream()
                .map(pedidoMapeador::aResumen)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PedidoDetalleDTO buscarPorId(Long pedidoId, Long usuarioId, boolean esAdmin) {
        return pedidoRepositorio.findById(pedidoId)
                .filter(pedido -> esAdmin || pedido.getUsuario().getId().equals(usuarioId))
                .map(pedidoMapeador::aDetalle)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pedido no encontrado"));
    }
}
