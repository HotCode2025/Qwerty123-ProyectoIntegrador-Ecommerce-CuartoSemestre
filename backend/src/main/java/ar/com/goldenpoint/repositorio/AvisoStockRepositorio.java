package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.entidad.AvisoStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface AvisoStockRepositorio extends JpaRepository<AvisoStock, Long> {

    boolean existsByEmailAndProductoIdAndTalleIdAndNotificadoFalse(String email, Long productoId, Long talleId);

    List<AvisoStock> findByProductoIdAndTalleIdAndNotificadoFalse(Long productoId, Long talleId);

    void deleteByProductoId(Long productoId);

    /** Avisos pendientes agrupados por producto y talle, para varios productos en una sola consulta. */
    @Query("""
            select a.producto.id as productoId, a.talle.id as talleId, count(a) as total
            from AvisoStock a
            where a.notificado = false and a.producto.id in :productoIds
            group by a.producto.id, a.talle.id""")
    List<ConteoPendiente> contarPendientesPorProductos(@Param("productoIds") Collection<Long> productoIds);

    interface ConteoPendiente {

        Long getProductoId();

        Long getTalleId();

        long getTotal();
    }
}
