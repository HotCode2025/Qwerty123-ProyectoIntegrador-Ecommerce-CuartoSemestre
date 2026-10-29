package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.evento.StockRepuestoEvento;
import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ActualizarStockDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ProductoSolicitudDTO;
import ar.com.goldenpoint.modelo.entidad.Categoria;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.StockProducto;
import ar.com.goldenpoint.modelo.entidad.Talle;
import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;
import ar.com.goldenpoint.modelo.mapeador.ProductoMapeador;
import ar.com.goldenpoint.repositorio.AvisoStockRepositorio;
import ar.com.goldenpoint.repositorio.CategoriaRepositorio;
import ar.com.goldenpoint.repositorio.EspecificacionesProducto;
import ar.com.goldenpoint.repositorio.ItemPedidoRepositorio;
import ar.com.goldenpoint.repositorio.MarcaRepositorio;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.repositorio.TalleRepositorio;
import ar.com.goldenpoint.servicio.IAdminProductoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProductoServicio implements IAdminProductoServicio {

    private final ProductoRepositorio productoRepositorio;
    private final CategoriaRepositorio categoriaRepositorio;
    private final MarcaRepositorio marcaRepositorio;
    private final TalleRepositorio talleRepositorio;
    private final AvisoStockRepositorio avisoStockRepositorio;
    private final ItemPedidoRepositorio itemPedidoRepositorio;
    private final ProductoMapeador productoMapeador;
    private final ApplicationEventPublisher publicadorEventos;
    private final AlmacenImagenesServicio almacenImagenes;

    @Override
    @Transactional(readOnly = true)
    public PaginaRespuestaDTO<ProductoAdminDTO> buscar(FiltroProductoAdminDTO filtro) {
        PageRequest paginacion = PageRequest.of(filtro.paginaOPorDefecto(), filtro.tamanioPaginaOPorDefecto(),
                Sort.by(Sort.Order.desc("fechaCreacion"), Sort.Order.desc("id")));
        Page<Producto> productos = productoRepositorio.findAll(
                EspecificacionesProducto.paraAdmin(filtro.busqueda(), filtro.habilitado()), paginacion);
        Map<Long, Map<Long, Long>> avisos = avisosPendientes(productos.map(Producto::getId).getContent());
        return PaginaRespuestaDTO.desde(productos.map(p -> productoMapeador.aAdmin(p, avisos.getOrDefault(p.getId(), Map.of()))));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoAdminDTO buscarPorId(Long id) {
        return aAdmin(buscarProducto(id));
    }

    @Override
    @Transactional
    public ProductoAdminDTO crear(ProductoSolicitudDTO dto) {
        Producto producto = Producto.builder().build(); // el builder inicializa la lista de stock vacía
        aplicar(producto, dto);
        return aAdmin(productoRepositorio.save(producto));
    }

    @Override
    @Transactional
    public ProductoAdminDTO editar(Long id, ProductoSolicitudDTO dto) {
        Producto producto = buscarProducto(id);
        aplicar(producto, dto);
        return aAdmin(producto);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarProducto(id);
        // Los pedidos guardan referencia al producto: uno vendido solo se puede dar de baja
        if (itemPedidoRepositorio.existsByProductoId(id)) {
            throw new ExcepcionNegocio("Este producto ya está en pedidos, así que no se puede eliminar. "
                    + "Podés darlo de baja para que no se vea en la tienda.", HttpStatus.CONFLICT);
        }
        avisoStockRepositorio.deleteByProductoId(id);
        productoRepositorio.delete(producto); // el stock por talle se borra en cascada
        productoRepositorio.flush(); // si la base rechaza el borrado, falla acá y la foto queda intacta
        if (producto.getImagenUrl() != null) {
            almacenImagenes.borrarImagenProducto(id);
        }
    }

    @Override
    @Transactional
    public ProductoAdminDTO actualizarStock(Long id, ActualizarStockDTO dto) {
        Producto producto = buscarProducto(id);
        TipoTalle tipoTalle = producto.getCategoria().getTipoTalle();

        Set<Long> vistos = new HashSet<>();
        for (ActualizarStockDTO.Linea linea : dto.items()) {
            if (!vistos.add(linea.talleId())) {
                throw new ExcepcionNegocio("Hay talles repetidos en la lista");
            }
        }
        Map<Long, Talle> talles = talleRepositorio.findAllById(vistos).stream()
                .collect(Collectors.toMap(Talle::getId, Function.identity()));
        Map<Long, StockProducto> actual = producto.getStock().stream()
                .collect(Collectors.toMap(s -> s.getTalle().getId(), Function.identity()));

        for (ActualizarStockDTO.Linea linea : dto.items()) {
            Talle talle = talles.get(linea.talleId());
            if (talle == null || talle.getTipoTalle() != tipoTalle) {
                throw new ExcepcionNegocio("Hay talles que no corresponden a la categoría " + producto.getCategoria().getNombre());
            }
            if (tipoTalle == TipoTalle.PELOTA && !producto.getDeporte().admiteTallePelota(talle.getEtiqueta())) {
                throw new ExcepcionNegocio("Las pelotas de " + producto.getDeporte().getEtiqueta() + " usan los talles "
                        + String.join(", ", producto.getDeporte().getTallesPelota()));
            }
            StockProducto stock = actual.get(talle.getId());
            int anterior = stock == null ? 0 : stock.getCantidad();
            if (stock == null) {
                producto.agregarStock(talle, linea.cantidad());
            } else {
                stock.setCantidad(linea.cantidad());
            }
            // Si el talle vuelve a tener stock, se avisa a quienes lo esperaban (mail después del commit)
            if (anterior == 0 && linea.cantidad() > 0 && producto.isHabilitado()) {
                publicadorEventos.publishEvent(new StockRepuestoEvento(producto.getId(), talle.getId()));
            }
        }
        productoRepositorio.saveAndFlush(producto); // asigna id a las filas nuevas antes de armar la respuesta
        return aAdmin(producto);
    }

    @Override
    @Transactional
    public ProductoAdminDTO actualizarImagen(Long id, MultipartFile archivo) {
        Producto producto = buscarProducto(id);
        byte[] bytes;
        try {
            bytes = archivo.getBytes();
        } catch (IOException e) {
            throw new ExcepcionNegocio("No se pudo leer el archivo");
        }
        if (bytes.length == 0 || !esImagenSoportada(bytes)) {
            throw new ExcepcionNegocio("La foto tiene que ser JPG, PNG o WEBP");
        }
        producto.setImagenUrl(almacenImagenes.subirImagenProducto(producto.getId(), bytes));
        return aAdmin(producto);
    }

    // Revisa los primeros bytes del archivo (la extensión o el tipo que manda el navegador se pueden falsear)
    private static boolean esImagenSoportada(byte[] b) {
        boolean jpg = b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean webp = b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        return jpg || png || webp;
    }

    // Copia los datos del formulario validando las reglas del negocio
    private void aplicar(Producto producto, ProductoSolicitudDTO dto) {
        Categoria categoria = categoriaRepositorio.findById(dto.categoriaId())
                .orElseThrow(() -> new ExcepcionNegocio("La categoría no existe"));
        boolean personalizable = Boolean.TRUE.equals(dto.personalizable());
        // Brief 3.3: solo se personalizan camisetas (talle de ropa) de fútbol y básquet
        if (personalizable && (categoria.getTipoTalle() != TipoTalle.ROPA || dto.deporte() == Deporte.PADEL)) {
            throw new ExcepcionNegocio("Solo se pueden personalizar camisetas de fútbol o básquet");
        }
        // Si cambia a una categoría con otro tipo de talle, el stock cargado deja de tener sentido
        if (producto.getCategoria() != null && producto.getCategoria().getTipoTalle() != categoria.getTipoTalle()) {
            if (producto.getStock().stream().anyMatch(s -> s.getCantidad() > 0)) {
                throw new ExcepcionNegocio("Dejá el stock en 0 antes de pasar a una categoría con otro tipo de talle",
                        HttpStatus.CONFLICT);
            }
            producto.getStock().clear();
        }
        // Brief 3.4: cada deporte tiene sus talles de pelota; las de pádel van en una categoría de talle único
        if (categoria.getTipoTalle() == TipoTalle.PELOTA) {
            if (dto.deporte().getTallesPelota().isEmpty()) {
                throw new ExcepcionNegocio("Las pelotas de " + dto.deporte().getEtiqueta()
                        + " van en una categoría de talle único (por ejemplo, Accesorios)");
            }
            if (producto.getStock().stream().anyMatch(s -> s.getCantidad() > 0 && !dto.deporte().admiteTallePelota(s.getTalle().getEtiqueta()))) {
                throw new ExcepcionNegocio("Dejá el stock en 0 antes de pasar la pelota a " + dto.deporte().getEtiqueta()
                        + ": usa otros talles", HttpStatus.CONFLICT);
            }
            producto.getStock().removeIf(s -> !dto.deporte().admiteTallePelota(s.getTalle().getEtiqueta()));
        }

        producto.setNombre(dto.nombre().trim());
        producto.setDescripcion(dto.descripcion() == null || dto.descripcion().isBlank() ? null : dto.descripcion().trim());
        if (dto.precioOferta() != null && dto.precioOferta().compareTo(dto.precio()) >= 0) {
            throw new ExcepcionNegocio("El precio de oferta tiene que ser menor que el precio normal");
        }
        producto.setPrecio(dto.precio());
        producto.setPrecioOferta(dto.precioOferta());
        producto.setDeporte(dto.deporte());
        producto.setCategoria(categoria);
        producto.setMarca(marcaRepositorio.findById(dto.marcaId())
                .orElseThrow(() -> new ExcepcionNegocio("La marca no existe")));
        producto.setPersonalizable(personalizable);
        producto.setDestacado(Boolean.TRUE.equals(dto.destacado()));
        producto.setHabilitado(dto.habilitado() == null || dto.habilitado());
    }

    private ProductoAdminDTO aAdmin(Producto producto) {
        return productoMapeador.aAdmin(producto,
                avisosPendientes(List.of(producto.getId())).getOrDefault(producto.getId(), Map.of()));
    }

    // productoId → (talleId → cantidad de avisos sin enviar)
    private Map<Long, Map<Long, Long>> avisosPendientes(List<Long> productoIds) {
        if (productoIds.isEmpty()) {
            return Map.of();
        }
        return avisoStockRepositorio.contarPendientesPorProductos(productoIds).stream()
                .collect(Collectors.groupingBy(AvisoStockRepositorio.ConteoPendiente::getProductoId,
                        Collectors.toMap(AvisoStockRepositorio.ConteoPendiente::getTalleId,
                                AvisoStockRepositorio.ConteoPendiente::getTotal)));
    }

    private Producto buscarProducto(Long id) {
        return productoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado"));
    }
}
