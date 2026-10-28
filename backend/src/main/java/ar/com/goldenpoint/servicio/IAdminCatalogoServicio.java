package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.CategoriaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.MarcaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CategoriaSolicitudDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.MarcaSolicitudDTO;

import java.util.List;

/** Gestión de marcas y categorías desde el panel. */
public interface IAdminCatalogoServicio {

    List<MarcaDTO> listarMarcas();

    MarcaDTO crearMarca(MarcaSolicitudDTO dto);

    MarcaDTO editarMarca(Long id, MarcaSolicitudDTO dto);

    void borrarMarca(Long id);

    List<CategoriaDTO> listarCategorias();

    CategoriaDTO crearCategoria(CategoriaSolicitudDTO dto);

    CategoriaDTO editarCategoria(Long id, CategoriaSolicitudDTO dto);

    void borrarCategoria(Long id);
}