package ar.com.goldenpoint.modelo.dto.respuesta;

/** Respuesta de registro e ingreso: el token para las próximas peticiones y los datos del usuario. */
public record AutenticacionRespuestaDTO(String token, UsuarioRespuestaDTO usuario) {
}
