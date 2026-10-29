package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.entidad.StockProducto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StockProductoRepositorio extends JpaRepository<StockProducto, Long> {

    // Bloquea la fila al descontar stock, así dos pagos simultáneos no venden la misma última unidad
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM StockProducto s WHERE s.producto.id = :productoId AND s.talle.id = :talleId")
    Optional<StockProducto> buscarParaActualizar(@Param("productoId") Long productoId, @Param("talleId") Long talleId);
}
