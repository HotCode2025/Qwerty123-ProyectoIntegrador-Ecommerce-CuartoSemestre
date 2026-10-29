package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.entidad.Pedido;
import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {

    // Historial del cliente, del pedido más nuevo al más viejo
    List<Pedido> findByUsuarioIdOrderByFechaCreacionDescIdDesc(Long usuarioId);

    Page<Pedido> findByEstado(EstadoPedido estado, Pageable paginacion);

    // Bloquea el pedido mientras se procesa un pago, así un aviso repetido no lo procesa dos veces
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    Optional<Pedido> buscarParaActualizar(@Param("id") Long id);
}
