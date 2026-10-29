package ar.com.goldenpoint.modelo.dto.respuesta;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;

import java.math.BigDecimal;
import java.util.List;

/** Opciones para armar los filtros del catálogo en una sola llamada. */
public record FiltrosCatalogoDTO(
        List<OpcionDeporte> deportes,
        List<OpcionCategoria> categorias,
        List<OpcionMarca> marcas,
        List<OpcionTalle> talles,
        BigDecimal precioMinimo,
        BigDecimal precioMaximo
) {

    public record OpcionDeporte(Deporte valor, String etiqueta, List<String> tallesPelota) {
    }

    public record OpcionCategoria(Long id, String nombre, TipoTalle tipoTalle) {
    }

    public record OpcionMarca(Long id, String nombre) {
    }

    public record OpcionTalle(Long id, String etiqueta, TipoTalle tipoTalle) {
    }
}
