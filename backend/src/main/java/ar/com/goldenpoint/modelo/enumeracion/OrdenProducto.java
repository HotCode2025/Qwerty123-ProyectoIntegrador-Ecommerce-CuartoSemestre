package ar.com.goldenpoint.modelo.enumeracion;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;

import java.util.Arrays;

/**
 * Órdenes permitidos en el catálogo. Se usan opciones fijas para que nadie pueda
 * pedir ordenar por un campo inexistente. El id desempata productos con el mismo valor.
 */
@Getter
@RequiredArgsConstructor
public enum OrdenProducto {
    RECIENTES(Sort.by(Sort.Order.desc("fechaCreacion"), Sort.Order.desc("id"))),
    // Por el precio que paga el cliente (el de oferta si tiene)
    PRECIO_ASC(Sort.by(Sort.Order.asc("precioFinal"), Sort.Order.asc("id"))),
    PRECIO_DESC(Sort.by(Sort.Order.desc("precioFinal"), Sort.Order.asc("id"))),
    NOMBRE(Sort.by(Sort.Order.asc("nombre"), Sort.Order.asc("id")));

    private final Sort orden;

    /** Convierte "precio_asc" (como llega en la URL) al enum; sin valor ordena por más recientes. */
    public static OrdenProducto desde(String valor) {
        if (valor == null || valor.isBlank()) {
            return RECIENTES;
        }
        return Arrays.stream(values())
                .filter(o -> o.name().equalsIgnoreCase(valor.trim()))
                .findFirst()
                .orElseThrow(() -> new ExcepcionNegocio("El orden debe ser recientes, precio_asc, precio_desc o nombre"));
    }
}
