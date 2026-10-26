package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.Rol;

/** Datos públicos del usuario (nunca incluye la contraseña). */
public record UsuarioRespuestaDTO(Long id, String nombre, String apellido, String email, String telefono, Rol rol) {
}
