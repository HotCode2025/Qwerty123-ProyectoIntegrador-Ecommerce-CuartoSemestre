package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.enumeracion.Rol;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    // Búsqueda del panel por nombre, apellido o email (el patrón ya viene en minúsculas con %)
    @Query("""
            SELECT u FROM Usuario u
            WHERE LOWER(u.nombre) LIKE :patron OR LOWER(u.apellido) LIKE :patron OR LOWER(u.email) LIKE :patron
            """)
    Page<Usuario> buscar(@Param("patron") String patron, Pageable paginacion);

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRol(Rol rol);
}
