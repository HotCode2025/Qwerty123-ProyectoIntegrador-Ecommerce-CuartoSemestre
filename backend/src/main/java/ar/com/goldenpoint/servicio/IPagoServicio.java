package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.ResultadoPagoDTO;
import ar.com.goldenpoint.modelo.entidad.Pedido;

public interface IPagoServicio {

    /** Crea la preferencia de Checkout Pro, guarda su id en el pedido y devuelve el link de pago. */
    String crearLinkPago(Pedido pedido);

    /** Consulta el pago en Mercado Pago y, si está aprobado, marca el pedido como pagado y descuenta stock. */
    ResultadoPagoDTO confirmar(Long pagoId, Long usuarioId);

    /** Procesa un aviso (webhook) de Mercado Pago después de verificar su firma. */
    void procesarWebhook(String tipo, String datoId, String firma, String idSolicitud);
}
