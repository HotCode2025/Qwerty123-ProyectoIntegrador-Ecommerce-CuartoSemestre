package ar.com.goldenpoint.modelo.mapeador;

import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioAdminDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.UsuarioRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.RegistroSolicitudDTO;
import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.enumeracion.Rol;
import org.springframework.stereotype.Component;

/** Convierte entre la entidad Usuario y sus DTOs. */
@Component
public class UsuarioMapeador {

    /** Crea un cliente nuevo; el email ya llega normalizado y la contraseña ya cifrada. */
    public Usuario aEntidad(RegistroSolicitudDTO dto, String email, String contrasenaHash) {
        return Usuario.builder()
                .nombre(dto.nombre().trim())
                .apellido(dto.apellido().trim())
                .email(email)
                .contrasenaHash(contrasenaHash)
                .telefono(dto.telefono() == null || dto.telefono().isBlank() ? null : dto.telefono().trim())
                .rol(Rol.CLIENTE)
                .build();
    }

    public UsuarioAdminDTO aAdminDTO(Usuario usuario) {
        return new UsuarioAdminDTO(usuario.getId(), usuario.getNombre(), usuario.getApellido(), usuario.getEmail(),
                usuario.getTelefono(), usuario.getRol(), usuario.isHabilitado(), usuario.getFechaCreacion());
    }

    public UsuarioRespuestaDTO aDTO(Usuario usuario) {
        return new UsuarioRespuestaDTO(usuario.getId(), usuario.getNombre(), usuario.getApellido(),
                usuario.getEmail(), usuario.getTelefono(), usuario.getRol());
    }
}
