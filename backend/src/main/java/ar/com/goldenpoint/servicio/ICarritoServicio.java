package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.CotizacionCarritoDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CarritoSolicitudDTO;

public interface ICarritoServicio {

    CotizacionCarritoDTO cotizar(CarritoSolicitudDTO carrito);
}
