package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.entidad.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemPedidoRepositorio extends JpaRepository<ItemPedido, Long> {

    boolean existsByProductoId(Long productoId);
}
