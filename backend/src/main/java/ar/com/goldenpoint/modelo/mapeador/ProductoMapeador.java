package ar.com.goldenpoint.modelo.mapeador;

import ar.com.goldenpoint.modelo.dto.respuesta.ProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoResumenDTO;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.StockProducto;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/** Convierte la entidad Producto en los DTOs del catálogo. */
@Component
public class ProductoMapeador {

    public ProductoResumenDTO aResumen(Producto producto) {
        boolean conStock = producto.getStock().stream().anyMatch(s -> s.getCantidad() > 0);
        return new ProductoResumenDTO(producto.getId(), producto.getNombre(), producto.getPrecio(), producto.getPrecioOferta(),
                producto.getDeporte(),
                producto.getCategoria().getNombre(), producto.getMarca().getNombre(), producto.getImagenUrl(),
                producto.isPersonalizable(), producto.isDestacado(), conStock);
    }

    public ProductoDetalleDTO aDetalle(Producto producto) {
        List<ProductoDetalleDTO.DisponibilidadTalle> talles = stockOrdenado(producto)
                .map(s -> new ProductoDetalleDTO.DisponibilidadTalle(s.getTalle().getId(), s.getTalle().getEtiqueta(),
                        s.getCantidad() > 0))
                .toList();
        return new ProductoDetalleDTO(producto.getId(), producto.getNombre(), producto.getDescripcion(), producto.getPrecio(),
                producto.getPrecioOferta(),
                producto.getDeporte(), producto.getCategoria().getId(), producto.getCategoria().getNombre(),
                producto.getMarca().getId(), producto.getMarca().getNombre(), producto.getImagenUrl(),
                producto.isPersonalizable(), talles);
    }

    /** avisosPorTalle: avisos de stock pendientes por id de talle (los talles que no están cuentan 0). */
    public ProductoAdminDTO aAdmin(Producto producto, Map<Long, Long> avisosPorTalle) {
        List<ProductoAdminDTO.LineaStock> stock = stockOrdenado(producto)
                .map(s -> new ProductoAdminDTO.LineaStock(s.getTalle().getId(), s.getTalle().getEtiqueta(), s.getCantidad(),
                        avisosPorTalle.getOrDefault(s.getTalle().getId(), 0L)))
                .toList();
        int total = stock.stream().mapToInt(ProductoAdminDTO.LineaStock::cantidad).sum();
        return new ProductoAdminDTO(producto.getId(), producto.getNombre(), producto.getDescripcion(), producto.getPrecio(),
                producto.getPrecioOferta(),
                producto.getDeporte(), producto.getCategoria().getId(), producto.getCategoria().getNombre(),
                producto.getCategoria().getTipoTalle(), producto.getMarca().getId(), producto.getMarca().getNombre(),
                producto.getImagenUrl(), producto.isPersonalizable(), producto.isDestacado(), producto.isHabilitado(),
                producto.getFechaCreacion(), total, stock);
    }

    // Talles en el orden lógico (S, M, L… / 39, 40, 41…)
    private Stream<StockProducto> stockOrdenado(Producto producto) {
        return producto.getStock().stream().sorted(Comparator.comparingInt(s -> s.getTalle().getOrden()));
    }
}
