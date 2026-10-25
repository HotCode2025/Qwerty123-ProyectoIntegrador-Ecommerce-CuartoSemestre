package ar.com.goldenpoint.configuracion;

import ar.com.goldenpoint.modelo.entidad.AjustesTienda;
import ar.com.goldenpoint.modelo.entidad.Categoria;
import ar.com.goldenpoint.modelo.entidad.Marca;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.Talle;
import ar.com.goldenpoint.modelo.entidad.Usuario;
import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import ar.com.goldenpoint.modelo.enumeracion.Rol;
import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;
import ar.com.goldenpoint.repositorio.AjustesTiendaRepositorio;
import ar.com.goldenpoint.repositorio.CategoriaRepositorio;
import ar.com.goldenpoint.repositorio.MarcaRepositorio;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.repositorio.TalleRepositorio;
import ar.com.goldenpoint.repositorio.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.IntStream;

/**
 * Carga los datos iniciales al arrancar la app:
 * - Talles y catálogo de prueba, solo si la base todavía no tiene talles.
 * - El primer administrador, solo si todavía no existe ninguno.
 * - Los ajustes de la tienda (envío y recargo), solo si todavía no están cargados.
 * Así no se duplican datos en cada inicio.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CargadorDatos implements CommandLineRunner {

    private final TalleRepositorio talleRepositorio;
    private final MarcaRepositorio marcaRepositorio;
    private final CategoriaRepositorio categoriaRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder codificadorContrasenas;
    private final AjustesTiendaRepositorio ajustesRepositorio;
    private final PropiedadesTienda valoresTienda;

    @Value("${golden-point.admin.email}")
    private String emailAdmin;

    @Value("${golden-point.admin.contrasena}")
    private String contrasenaAdmin;

    private final Map<String, Talle> talles = new HashMap<>();

    @Override
    @Transactional
    public void run(String... args) {
        if (talleRepositorio.count() == 0) {
            cargarCatalogo();
        }
        cargarAdministrador();
        cargarAjustes();
    }

    private void cargarAjustes() {
        if (ajustesRepositorio.existsById(AjustesTienda.ID_UNICO)) {
            return;
        }
        ajustesRepositorio.save(AjustesTienda.builder()
                .id(AjustesTienda.ID_UNICO)
                .costoEnvio(valoresTienda.costoEnvio())
                .envioGratisDesde(valoresTienda.envioGratisDesde())
                .recargoPersonalizacion(valoresTienda.recargoPersonalizacion())
                .build());
        log.info("Ajustes de la tienda cargados con los valores de application.yml");
    }

    private void cargarAdministrador() {
        if (usuarioRepositorio.existsByRol(Rol.ADMIN)) {
            return;
        }
        if (emailAdmin.isBlank() || contrasenaAdmin.isBlank()) {
            log.warn("No se creó el administrador inicial: faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env");
            return;
        }
        usuarioRepositorio.save(Usuario.builder()
                .nombre("Administrador")
                .apellido("Golden Point")
                .email(emailAdmin.trim().toLowerCase(Locale.ROOT))
                .contrasenaHash(codificadorContrasenas.encode(contrasenaAdmin))
                .rol(Rol.ADMIN)
                .build());
        log.info("Administrador inicial creado: {}", emailAdmin);
    }

    private void cargarCatalogo() {
        cargarTalles(TipoTalle.ROPA, List.of("S", "M", "L", "XL", "XXL"));
        cargarTalles(TipoTalle.CALZADO, IntStream.rangeClosed(35, 46).mapToObj(String::valueOf).toList());
        cargarTalles(TipoTalle.PELOTA, List.of("N° 3", "N° 4", "N° 5", "N° 6", "N° 7"));
        cargarTalles(TipoTalle.UNICO, List.of("Único"));

        Marca goldenPoint = marca("Golden Point");
        Marca atlas = marca("Atlas");
        Marca vertice = marca("Vértice");

        Categoria camisetas = categoria("Camisetas", TipoTalle.ROPA);
        Categoria calzado = categoria("Calzado", TipoTalle.CALZADO);
        Categoria pelotas = categoria("Pelotas", TipoTalle.PELOTA);
        Categoria paletas = categoria("Paletas", TipoTalle.UNICO);
        Categoria accesorios = categoria("Accesorios", TipoTalle.UNICO);

        // El stock en 0 representa un talle sin stock, para probar "Avisarme cuando llegue"
        producto("Camiseta Titular 26", "Tela respirable de secado rápido, cuello redondo y corte regular.",
                45000, Deporte.FUTBOL, camisetas, goldenPoint, true, true,
                Map.of("S", 5, "M", 8, "L", 6, "XL", 3, "XXL", 0));
        producto("Botines Strike FG", "Suela para césped natural y capellada sintética liviana.",
                89000, Deporte.FUTBOL, calzado, atlas, false, true,
                Map.of("39", 0, "40", 4, "41", 6, "42", 5, "43", 2, "44", 0));
        producto("Pelota Match N° 5", "Costura térmica y cámara de látex para un rebote parejo.",
                32000, Deporte.FUTBOL, pelotas, atlas, false, false,
                Map.of("N° 4", 7, "N° 5", 12));
        producto("Camiseta Básquet Home", "Musculosa de malla liviana con terminaciones reforzadas.",
                38500, Deporte.BASQUET, camisetas, goldenPoint, true, false,
                Map.of("S", 0, "M", 6, "L", 7, "XL", 4, "XXL", 2));
        producto("Zapatillas Rebote Mid", "Caña media con amortiguación en talón y antepié.",
                112000, Deporte.BASQUET, calzado, vertice, false, true,
                Map.of("40", 3, "41", 5, "42", 6, "43", 4, "44", 2, "45", 0));
        producto("Pelota Indoor N° 7", "Cuero sintético con grip para cancha cubierta.",
                41000, Deporte.BASQUET, pelotas, vertice, false, false,
                Map.of("N° 6", 5, "N° 7", 9));
        producto("Paleta Carbon Pro", "Marco de carbono, núcleo de goma EVA y balance medio.",
                120000, Deporte.PADEL, paletas, vertice, false, true,
                Map.of("Único", 6));
        producto("Pelotas de pádel x3", "Tubo presurizado con tres pelotas de competición.",
                12500, Deporte.PADEL, accesorios, atlas, false, false,
                Map.of("Único", 20));

        log.info("Datos de prueba cargados: {} talles, {} marcas, {} categorías y {} productos",
                talles.size(), marcaRepositorio.count(), categoriaRepositorio.count(), productoRepositorio.count());
    }

    private void cargarTalles(TipoTalle tipo, List<String> etiquetas) {
        for (int i = 0; i < etiquetas.size(); i++) {
            Talle talle = talleRepositorio.save(Talle.builder().tipoTalle(tipo).etiqueta(etiquetas.get(i)).orden(i + 1).build());
            talles.put(clave(tipo, talle.getEtiqueta()), talle);
        }
    }

    private Marca marca(String nombre) {
        return marcaRepositorio.save(Marca.builder().nombre(nombre).build());
    }

    private Categoria categoria(String nombre, TipoTalle tipoTalle) {
        return categoriaRepositorio.save(Categoria.builder().nombre(nombre).tipoTalle(tipoTalle).build());
    }

    private void producto(String nombre, String descripcion, int precio, Deporte deporte, Categoria categoria, Marca marca,
                          boolean personalizable, boolean destacado, Map<String, Integer> stockPorTalle) {
        Producto producto = Producto.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(BigDecimal.valueOf(precio))
                .deporte(deporte)
                .categoria(categoria)
                .marca(marca)
                .personalizable(personalizable)
                .destacado(destacado)
                .build();
        // Cada talle se busca según el tipo de talle de la categoría
        stockPorTalle.forEach((etiqueta, cantidad) ->
                producto.agregarStock(talles.get(clave(categoria.getTipoTalle(), etiqueta)), cantidad));
        productoRepositorio.save(producto);
    }

    private static String clave(TipoTalle tipo, String etiqueta) {
        return tipo + ":" + etiqueta;
    }
}
