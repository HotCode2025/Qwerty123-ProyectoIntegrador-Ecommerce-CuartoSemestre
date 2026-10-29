package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.solicitud.AvisoStockSolicitudDTO;

public interface IAvisoStockServicio {

    /** Registra el aviso. Si ya existe uno pendiente para ese email y talle, no lo duplica. */
    void crear(AvisoStockSolicitudDTO dto);

    /** Manda el mail "volvió tu talle" a todos los avisos pendientes de ese producto y talle. */
    void notificarReposicion(Long productoId, Long talleId);
}
