package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.CategoriaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.MarcaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CategoriaSolicitudDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.MarcaSolicitudDTO;
import ar.com.goldenpoint.modelo.entidad.Categoria;
import ar.com.goldenpoint.modelo.entidad.Marca;
import ar.com.goldenpoint.repositorio.CategoriaRepositorio;
import ar.com.goldenpoint.repositorio.MarcaRepositorio;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.servicio.IAdminCatalogoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCatalogoServicio implements IAdminCatalogoServicio {

    private final MarcaRepositorio marcaRepositorio;
    private final CategoriaRepositorio categoriaRepositorio;
    private final ProductoRepositorio productoRepositorio;

    @Override
    @Transactional(readOnly = true)
    public List<MarcaDTO> listarMarcas() {
        return marcaRepositorio.findAll(Sort.by("nombre")).stream().map(this::aDTO).toList();
    }

    @Override
    @Transactional
    public MarcaDTO crearMarca(MarcaSolicitudDTO dto) {
        String nombre = dto.nombre().trim();
        if (marcaRepositorio.existsByNombreIgnoreCase(nombre)) {
            throw repetida("marca");
        }
        return aDTO(marcaRepositorio.save(Marca.builder().nombre(nombre).build()));
    }

    @Override
    @Transactional
    public MarcaDTO editarMarca(Long id, MarcaSolicitudDTO dto) {
        Marca marca = buscarMarca(id);
        String nombre = dto.nombre().trim();
        if (marcaRepositorio.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw repetida("marca");
        }
        marca.setNombre(nombre);
        return aDTO(marca);
    }

    @Override
    @Transactional
    public void borrarMarca(Long id) {
        Marca marca = buscarMarca(id);
        if (productoRepositorio.countByMarcaId(id) > 0) {
            throw new ExcepcionNegocio("No se puede borrar una marca que tiene productos", HttpStatus.CONFLICT);
        }
        marcaRepositorio.delete(marca);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaDTO> listarCategorias() {
        return categoriaRepositorio.findAll(Sort.by("nombre")).stream().map(this::aDTO).toList();
    }

    @Override
    @Transactional
    public CategoriaDTO crearCategoria(CategoriaSolicitudDTO dto) {
        String nombre = dto.nombre().trim();
        if (categoriaRepositorio.existsByNombreIgnoreCase(nombre)) {
            throw repetida("categoría");
        }
        return aDTO(categoriaRepositorio.save(Categoria.builder().nombre(nombre).tipoTalle(dto.tipoTalle()).build()));
    }

    @Override
    @Transactional
    public CategoriaDTO editarCategoria(Long id, CategoriaSolicitudDTO dto) {
        Categoria categoria = buscarCategoria(id);
        String nombre = dto.nombre().trim();
        if (categoriaRepositorio.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw repetida("categoría");
        }
        // Cambiar el tipo de talle dejaría inválido el stock de sus productos
        if (categoria.getTipoTalle() != dto.tipoTalle() && productoRepositorio.countByCategoriaId(id) > 0) {
            throw new ExcepcionNegocio("No se puede cambiar el tipo de talle de una categoría que tiene productos",
                    HttpStatus.CONFLICT);
        }
        categoria.setNombre(nombre);
        categoria.setTipoTalle(dto.tipoTalle());
        return aDTO(categoria);
    }

    @Override
    @Transactional
    public void borrarCategoria(Long id) {
        Categoria categoria = buscarCategoria(id);
        if (productoRepositorio.countByCategoriaId(id) > 0) {
            throw new ExcepcionNegocio("No se puede borrar una categoría que tiene productos", HttpStatus.CONFLICT);
        }
        categoriaRepositorio.delete(categoria);
    }

    private Marca buscarMarca(Long id) {
        return marcaRepositorio.findById(id).orElseThrow(() -> new RecursoNoEncontradoExcepcion("Marca no encontrada"));
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Categoría no encontrada"));
    }

    private MarcaDTO aDTO(Marca marca) {
        return new MarcaDTO(marca.getId(), marca.getNombre(), productoRepositorio.countByMarcaId(marca.getId()));
    }

    private CategoriaDTO aDTO(Categoria categoria) {
        return new CategoriaDTO(categoria.getId(), categoria.getNombre(), categoria.getTipoTalle(),
                productoRepositorio.countByCategoriaId(categoria.getId()));
    }

    private static ExcepcionNegocio repetida(String que) {
        return new ExcepcionNegocio("Ya existe una " + que + " con ese nombre", HttpStatus.CONFLICT);
    }
}
