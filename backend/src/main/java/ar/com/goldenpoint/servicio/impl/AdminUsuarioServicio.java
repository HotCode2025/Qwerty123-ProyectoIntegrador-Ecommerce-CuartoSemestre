package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioAdminDTO;
import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.enumeracion.Rol;
import ar.com.goldenpoint.modelo.mapeador.UsuarioMapeador;
import ar.com.goldenpoint.repositorio.UsuarioRepositorio;
import ar.com.goldenpoint.servicio.IAdminUsuarioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminUsuarioServicio implements IAdminUsuarioServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final UsuarioMapeador usuarioMapeador;

    @Override
    @Transactional(readOnly = true)
    public PaginaRespuestaDTO<UsuarioAdminDTO> buscar(String busqueda, int pagina, int tamanioPagina) {
        PageRequest paginacion = PageRequest.of(pagina, tamanioPagina,
                Sort.by(Sort.Order.desc("fechaCreacion"), Sort.Order.desc("id")));
        var usuarios = busqueda == null || busqueda.isBlank()
                ? usuarioRepositorio.findAll(paginacion)
                : usuarioRepositorio.buscar("%" + busqueda.trim().toLowerCase(Locale.ROOT) + "%", paginacion);
        return PaginaRespuestaDTO.desde(usuarios.map(usuarioMapeador::aAdminDTO));
    }

    @Override
    @Transactional
    public UsuarioAdminDTO cambiarHabilitado(Long usuarioId, boolean habilitado, Long adminId) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
        // Evita que la tienda se quede sin administrador por error
        if (usuario.getId().equals(adminId) || usuario.getRol() == Rol.ADMIN) {
            throw new ExcepcionNegocio("No se puede deshabilitar ni habilitar una cuenta de administrador desde acá",
                    HttpStatus.CONFLICT);
        }
        usuario.setHabilitado(habilitado);
        return usuarioMapeador.aAdminDTO(usuario);
    }
}

