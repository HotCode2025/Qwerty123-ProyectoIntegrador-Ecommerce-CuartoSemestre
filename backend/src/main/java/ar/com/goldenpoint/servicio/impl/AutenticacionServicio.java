package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.AutenticacionRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.IngresoSolicitudDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.RegistroSolicitudDTO;
import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.mapeador.UsuarioMapeador;
import ar.com.goldenpoint.repositorio.UsuarioRepositorio;
import ar.com.goldenpoint.seguridad.TokenServicio;
import ar.com.goldenpoint.servicio.IAutenticacionServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AutenticacionServicio implements IAutenticacionServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final UsuarioMapeador usuarioMapeador;
    private final PasswordEncoder codificadorContrasenas;
    private final TokenServicio tokenServicio;

    @Override
    @Transactional
    public AutenticacionRespuestaDTO registrar(RegistroSolicitudDTO dto) {
        String email = normalizarEmail(dto.email());
        if (usuarioRepositorio.existsByEmail(email)) {
            throw new ExcepcionNegocio("Ya existe una cuenta con ese email", HttpStatus.CONFLICT);
        }
        Usuario usuario = usuarioRepositorio.save(
                usuarioMapeador.aEntidad(dto, email, codificadorContrasenas.encode(dto.contrasena())));
        return armarRespuesta(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public AutenticacionRespuestaDTO ingresar(IngresoSolicitudDTO dto) {
        // Mismo mensaje si no existe el email o si la contraseña no coincide, para no revelar qué cuentas existen
        Usuario usuario = usuarioRepositorio.findByEmail(normalizarEmail(dto.email()))
                .filter(u -> codificadorContrasenas.matches(dto.contrasena(), u.getContrasenaHash()))
                .orElseThrow(() -> new ExcepcionNegocio("Email o contraseña incorrectos", HttpStatus.UNAUTHORIZED));
        verificarHabilitado(usuario);
        return armarRespuesta(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioRespuestaDTO obtenerUsuarioActual(Long usuarioId) {
        Usuario usuario = usuarioRepositorio.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Usuario no encontrado"));
        verificarHabilitado(usuario);
        return usuarioMapeador.aDTO(usuario);
    }

    private AutenticacionRespuestaDTO armarRespuesta(Usuario usuario) {
        return new AutenticacionRespuestaDTO(tokenServicio.generarToken(usuario), usuarioMapeador.aDTO(usuario));
    }

    private void verificarHabilitado(Usuario usuario) {
        if (!usuario.isHabilitado()) {
            throw new ExcepcionNegocio("Tu cuenta está deshabilitada", HttpStatus.FORBIDDEN);
        }
    }

    // "Ana@Mail.com " y "ana@mail.com" son la misma cuenta
    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
