package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Producto como lo ve el administrador: con estado y cantidad exacta de stock por talle. */
public record ProductoAdminDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        BigDecimal precioOferta,
        Deporte deporte,
        Long categoriaId,
        String categoriaNombre,
        TipoTalle tipoTalle,
        Long marcaId,
        String marcaNombre,
        String imagenUrl,
        boolean personalizable,
        boolean destacado,
        boolean habilitado,
        LocalDateTime fechaCreacion,
        int stockTotal,
        List<LineaStock> stock
) {

    /** avisosPendientes: cuántas personas pidieron "Avisarme cuando llegue" para ese talle y todavía no recibieron el mail. */
    public record LineaStock(Long talleId, String etiqueta, int cantidad, long avisosPendientes) {
    }
}
