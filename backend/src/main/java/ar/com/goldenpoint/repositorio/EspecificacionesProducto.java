package ar.com.goldenpoint.repositorio;

import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoDTO;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.StockProducto;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

/**
 * Arma la consulta del catálogo sumando solo los filtros que vienen en la petición.
 * Siempre excluye los productos dados de baja.
 */
public final class EspecificacionesProducto {

    private EspecificacionesProducto() {
    }

    /** Listado del panel: incluye los dados de baja salvo que se filtre por estado. */
    public static Specification<Producto> paraAdmin(String busqueda, Boolean habilitado) {
        Specification<Producto> spec = Specification.unrestricted();
        if (habilitado != null) {
            spec = spec.and((raiz, consulta, cb) -> cb.equal(raiz.get("habilitado"), habilitado));
        }
        return busqueda == null || busqueda.isBlank() ? spec : spec.and(coincideTexto(busqueda));
    }

    public static Specification<Producto> desdeFiltro(FiltroProductoDTO f) {
        Specification<Producto> spec = (raiz, consulta, cb) -> cb.isTrue(raiz.get("habilitado"));

        if (f.deporte() != null) {
            spec = spec.and((raiz, consulta, cb) -> cb.equal(raiz.get("deporte"), f.deporte()));
        }
        if (f.categoriaId() != null) {
            spec = spec.and((raiz, consulta, cb) -> cb.equal(raiz.get("categoria").get("id"), f.categoriaId()));
        }
        if (f.marcaId() != null) {
            spec = spec.and((raiz, consulta, cb) -> cb.equal(raiz.get("marca").get("id"), f.marcaId()));
        }
        if (f.precioMinimo() != null) {
            spec = spec.and((raiz, consulta, cb) -> cb.greaterThanOrEqualTo(raiz.get("precioFinal"), f.precioMinimo()));
        }
        if (f.precioMaximo() != null) {
            spec = spec.and((raiz, consulta, cb) -> cb.lessThanOrEqualTo(raiz.get("precioFinal"), f.precioMaximo()));
        }
        if (Boolean.TRUE.equals(f.enOferta())) {
            spec = spec.and((raiz, consulta, cb) -> cb.isNotNull(raiz.get("precioOferta")));
        }
        if (Boolean.TRUE.equals(f.destacado())) {
            spec = spec.and((raiz, consulta, cb) -> cb.isTrue(raiz.get("destacado")));
        }
        if (f.busqueda() != null && !f.busqueda().isBlank()) {
            spec = spec.and(coincideTexto(f.busqueda()));
        }
        if (f.talleId() != null) {
            // Existe una fila de stock con cantidad mayor a 0 para ese producto y ese talle
            spec = spec.and((raiz, consulta, cb) -> {
                Subquery<Long> sub = consulta.subquery(Long.class);
                var stock = sub.from(StockProducto.class);
                sub.select(stock.get("id")).where(
                        cb.equal(stock.get("producto"), raiz),
                        cb.equal(stock.get("talle").get("id"), f.talleId()),
                        cb.greaterThan(stock.get("cantidad"), 0));
                return cb.exists(sub);
            });
        }
        return spec;
    }

    // Busca el texto en el nombre del producto o de la marca, sin distinguir mayúsculas
    private static Specification<Producto> coincideTexto(String texto) {
        String patron = "%" + texto.trim().toLowerCase(Locale.ROOT) + "%";
        return (raiz, consulta, cb) -> cb.or(
                cb.like(cb.lower(raiz.get("nombre")), patron),
                cb.like(cb.lower(raiz.get("marca").get("nombre")), patron));
    }
}
