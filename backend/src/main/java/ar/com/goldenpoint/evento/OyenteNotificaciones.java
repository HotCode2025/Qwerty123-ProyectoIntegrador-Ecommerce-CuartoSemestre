package ar.com.goldenpoint.evento;

import ar.com.goldenpoint.repositorio.PedidoRepositorio;
import ar.com.goldenpoint.servicio.IAvisoStockServicio;
import ar.com.goldenpoint.servicio.impl.CorreoServicio;
import ar.com.goldenpoint.servicio.impl.PlantillasCorreo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Manda los mails cuando ocurre un evento del negocio.
 * AFTER_COMMIT: solo se ejecuta si la operación se guardó bien (un pago que falla no manda mail).
 * {@code @Async}: corre en segundo plano, así el cliente no espera a Brevo y un error de mail no afecta al pago.
 */
@Component
@RequiredArgsConstructor
public class OyenteNotificaciones {

    private final PedidoRepositorio pedidoRepositorio;
    private final CorreoServicio correoServicio;
    private final PlantillasCorreo plantillasCorreo;
    private final IAvisoStockServicio avisoStockServicio;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void alPagarPedido(PedidoPagadoEvento evento) {
        pedidoRepositorio.findById(evento.pedidoId()).ifPresent(pedido -> correoServicio.enviar(
                pedido.getUsuario().getEmail(),
                pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido(),
                "Pedido #" + pedido.getId() + " confirmado · Golden Point",
                plantillasCorreo.pedidoConfirmado(pedido)));
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alReponerStock(StockRepuestoEvento evento) {
        avisoStockServicio.notificarReposicion(evento.productoId(), evento.talleId());
    }
}
