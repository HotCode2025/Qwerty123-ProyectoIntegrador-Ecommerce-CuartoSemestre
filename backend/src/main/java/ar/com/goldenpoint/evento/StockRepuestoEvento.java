package ar.com.goldenpoint.evento;

/** Se publica cuando un talle pasa de 0 a tener stock. Dispara los avisos "volvió tu talle". */
public record StockRepuestoEvento(Long productoId, Long talleId) {
}
