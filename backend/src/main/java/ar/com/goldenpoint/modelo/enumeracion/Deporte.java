package ar.com.goldenpoint.modelo.enumeracion;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Deportes que vende la tienda (fijos según el brief), con el nombre que ve el cliente
 * y los talles de pelota de cada uno (brief 3.4: fútbol N° 3 a 5, básquet N° 6 y 7).
 */
@Getter
@RequiredArgsConstructor
public enum Deporte {
    FUTBOL("Fútbol", List.of("N° 3", "N° 4", "N° 5")),
    BASQUET("Básquet", List.of("N° 6", "N° 7")),
    PADEL("Pádel", List.of()); // las pelotas de pádel se venden por tubo, con talle único

    private final String etiqueta;
    private final List<String> tallesPelota;

    public boolean admiteTallePelota(String etiquetaTalle) {
        return tallesPelota.contains(etiquetaTalle);
    }
}
