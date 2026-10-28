package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioAdminDTO;

public interface IAdminUsuarioServicio {

    PaginaRespuestaDTO<UsuarioAdminDTO> buscar(String busqueda, int pagina, int tamanioPagina);

    /** Habilita o deshabilita una cuenta de cliente. adminId es quien hace el cambio. */
    UsuarioAdminDTO cambiarHabilitado(Long usuarioId, boolean habilitado, Long adminId);
}
