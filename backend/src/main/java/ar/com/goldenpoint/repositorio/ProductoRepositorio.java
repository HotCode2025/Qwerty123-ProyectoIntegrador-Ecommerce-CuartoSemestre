package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.entidad.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

// JpaSpecificationExecutor permite buscar con los filtros dinámicos de EspecificacionesProducto
public interface ProductoRepositorio extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {

    Optional<Producto> findByIdAndHabilitadoTrue(Long id);

    // Cuentan también los productos dados de baja: siguen apuntando a la marca o categoría
    long countByMarcaId(Long marcaId);

    long countByCategoriaId(Long categoriaId);

    // Rango del filtro de precio, con el precio que paga el cliente
    @Query("SELECT MIN(p.precioFinal) FROM Producto p WHERE p.habilitado = true")
    BigDecimal buscarPrecioMinimoHabilitado();

    @Query("SELECT MAX(p.precioFinal) FROM Producto p WHERE p.habilitado = true")
    BigDecimal buscarPrecioMaximoHabilitado();
}
