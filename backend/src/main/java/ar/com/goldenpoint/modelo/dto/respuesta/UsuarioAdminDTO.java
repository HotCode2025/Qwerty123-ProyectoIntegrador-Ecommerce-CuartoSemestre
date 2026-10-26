package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.Rol;

import java.time.LocalDateTime;

/** Usuario como lo ve el administrador (nunca incluye la contraseña). */
public record UsuarioAdminDTO(
        Long id,
        String nombre,
        String apellido,
        String email,
        String telefono,
        Rol rol,
        boolean habilitado,
        LocalDateTime fechaCreacion
) {
}
