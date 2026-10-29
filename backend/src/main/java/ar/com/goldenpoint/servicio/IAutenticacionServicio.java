package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.AutenticacionRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.IngresoSolicitudDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.RegistroSolicitudDTO;

public interface IAutenticacionServicio {

    AutenticacionRespuestaDTO registrar(RegistroSolicitudDTO dto);

    AutenticacionRespuestaDTO ingresar(IngresoSolicitudDTO dto);

    UsuarioRespuestaDTO obtenerUsuarioActual(Long usuarioId);
}
