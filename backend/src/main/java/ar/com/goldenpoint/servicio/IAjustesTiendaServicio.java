package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.AjustesTiendaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.AjustesTiendaSolicitudDTO;

public interface IAjustesTiendaServicio {

    /** Ajustes vigentes: los usa la calculadora del carrito y los muestra la tienda. */
    AjustesTiendaDTO obtener();

    AjustesTiendaDTO actualizar(AjustesTiendaSolicitudDTO dto);
}
