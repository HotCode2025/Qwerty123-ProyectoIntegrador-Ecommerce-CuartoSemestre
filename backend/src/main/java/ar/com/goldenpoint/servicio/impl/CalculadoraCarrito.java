package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.modelo.dto.respuesta.AjustesTiendaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.CotizacionCarritoDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ItemCarritoDTO;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.StockProducto;
import ar.com.goldenpoint.modelo.entidad.Talle;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.servicio.IAjustesTiendaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Único lugar donde se calculan precios, recargos, envío y stock del carrito.
 * Lo usan tanto la cotización como la creación del pedido, así nunca dan resultados distintos.
 * Los precios siempre salen de la base de datos, nunca del navegador.
 */
@Component
@RequiredArgsConstructor
public class CalculadoraCarrito {

    // Hasta 12 letras (con tildes y Ñ) y espacios, ya pasado a mayúsculas
    private static final Pattern NOMBRE_PERSONALIZADO = Pattern.compile("^[A-ZÁÉÍÓÚÑÜ ]{1,12}$");

    private final ProductoRepositorio productoRepositorio;
    private final IAjustesTiendaServicio ajustesServicio;

    /** Línea ya validada y con precio, lista para guardarse como ítem de pedido. */
    public record LineaConPrecio(Producto producto, Talle talle, int cantidad, BigDecimal precioUnitario,
                                 BigDecimal recargoUnitario, String nombrePersonalizado, Integer numeroPersonalizado) {
    }

    /** La cotización para el cliente y las líneas válidas para crear el pedido. */
    public record Resultado(CotizacionCarritoDTO cotizacion, List<LineaConPrecio> lineas) {
    }

    public Resultado calcular(List<ItemCarritoDTO> items) {
        AjustesTiendaDTO tienda = ajustesServicio.obtener();
        Map<Long, Producto> productos = productoRepositorio
                .findAllById(items.stream().map(ItemCarritoDTO::productoId).distinct().toList())
                .stream().collect(Collectors.toMap(Producto::getId, Function.identity()));

        // Unidades pedidas por producto y talle sumando todas las líneas (3 camisetas M con distinto nombre = 3 de M)
        Map<String, Integer> pedidas = new HashMap<>();
        items.forEach(i -> pedidas.merge(claveStock(i), i.cantidad(), Integer::sum));

        List<CotizacionCarritoDTO.Linea> lineasCotizacion = new ArrayList<>();
        List<LineaConPrecio> lineasConPrecio = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal recargos = BigDecimal.ZERO;

        for (ItemCarritoDTO item : items) {
            Producto producto = productos.get(item.productoId());
            StockProducto stock = producto == null ? null : buscarStock(producto, item.talleId());
            String nombrePersonalizado = normalizarNombre(item.nombrePersonalizado());
            String problema = buscarProblema(producto, stock, item, nombrePersonalizado, pedidas.get(claveStock(item)));

            BigDecimal precioUnitario = producto == null ? null : producto.precioVigente();
            BigDecimal precioSinOferta = producto == null || producto.getPrecioOferta() == null ? null : producto.getPrecio();
            BigDecimal recargoUnitario = null;
            BigDecimal totalLinea = null;
            if (problema == null) {
                BigDecimal cantidad = BigDecimal.valueOf(item.cantidad());
                recargoUnitario = nombrePersonalizado != null ? tienda.recargoPersonalizacion() : BigDecimal.ZERO;
                totalLinea = precioUnitario.add(recargoUnitario).multiply(cantidad);
                subtotal = subtotal.add(precioUnitario.multiply(cantidad));
                recargos = recargos.add(recargoUnitario.multiply(cantidad));
                lineasConPrecio.add(new LineaConPrecio(producto, stock.getTalle(), item.cantidad(), precioUnitario,
                        recargoUnitario, nombrePersonalizado, item.numeroPersonalizado()));
            }
            lineasCotizacion.add(new CotizacionCarritoDTO.Linea(item.productoId(), item.talleId(),
                    producto == null ? null : producto.getNombre(),
                    stock == null ? null : stock.getTalle().getEtiqueta(),
                    producto == null ? null : producto.getImagenUrl(),
                    item.cantidad(), nombrePersonalizado, item.numeroPersonalizado(), precioUnitario, precioSinOferta, recargoUnitario,
                    totalLinea, problema));
        }

        // El envío gratis se calcula sobre productos + personalización, igual que muestra la barra del carrito
        BigDecimal mercaderia = subtotal.add(recargos);
        boolean envioGratis = mercaderia.compareTo(tienda.envioGratisDesde()) >= 0;
        BigDecimal envio = lineasConPrecio.isEmpty() || envioGratis ? BigDecimal.ZERO : tienda.costoEnvio();
        BigDecimal faltante = envioGratis ? BigDecimal.ZERO : tienda.envioGratisDesde().subtract(mercaderia);

        CotizacionCarritoDTO cotizacion = new CotizacionCarritoDTO(lineasCotizacion, subtotal, recargos, envio,
                mercaderia.add(envio), tienda.envioGratisDesde(), faltante, lineasConPrecio.size() == items.size());
        return new Resultado(cotizacion, lineasConPrecio);
    }

    /** Devuelve el problema de la línea, o null si está todo bien. */
    private String buscarProblema(Producto producto, StockProducto stock, ItemCarritoDTO item, String nombrePersonalizado,
                                  int unidadesPedidas) {
        if (producto == null || !producto.isHabilitado()) {
            return "Este producto ya no está disponible";
        }
        if (stock == null) {
            return "El talle elegido no corresponde a este producto";
        }
        boolean tieneNombre = nombrePersonalizado != null;
        boolean tieneNumero = item.numeroPersonalizado() != null;
        if (tieneNombre || tieneNumero) {
            if (!producto.isPersonalizable()) {
                return "Este producto no se puede personalizar";
            }
            if (tieneNombre != tieneNumero) {
                return "Completá nombre y número, o dejá los dos vacíos";
            }
            if (!NOMBRE_PERSONALIZADO.matcher(nombrePersonalizado).matches()) {
                return "El nombre solo puede tener letras y espacios";
            }
        }
        if (unidadesPedidas > stock.getCantidad()) {
            return "No hay stock suficiente para esa cantidad";
        }
        return null;
    }

    private StockProducto buscarStock(Producto producto, Long talleId) {
        return producto.getStock().stream()
                .filter(s -> s.getTalle().getId().equals(talleId))
                .findFirst()
                .orElse(null);
    }

    // "  romero  jr " -> "ROMERO JR"; vacío -> null
    private String normalizarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            return null;
        }
        return nombre.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }

    private static String claveStock(ItemCarritoDTO item) {
        return item.productoId() + ":" + item.talleId();
    }
}
