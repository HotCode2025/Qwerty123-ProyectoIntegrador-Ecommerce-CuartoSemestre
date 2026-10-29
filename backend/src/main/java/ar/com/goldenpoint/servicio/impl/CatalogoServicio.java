package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.modelo.dto.respuesta.FiltrosCatalogoDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.FiltrosCatalogoDTO.OpcionCategoria;
import ar.com.goldenpoint.modelo.dto.respuesta.FiltrosCatalogoDTO.OpcionDeporte;
import ar.com.goldenpoint.modelo.dto.respuesta.FiltrosCatalogoDTO.OpcionMarca;
import ar.com.goldenpoint.modelo.dto.respuesta.FiltrosCatalogoDTO.OpcionTalle;
import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import ar.com.goldenpoint.repositorio.CategoriaRepositorio;
import ar.com.goldenpoint.repositorio.MarcaRepositorio;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.repositorio.TalleRepositorio;
import ar.com.goldenpoint.servicio.ICatalogoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoServicio implements ICatalogoServicio {

    private final CategoriaRepositorio categoriaRepositorio;
    private final MarcaRepositorio marcaRepositorio;
    private final TalleRepositorio talleRepositorio;
    private final ProductoRepositorio productoRepositorio;

    @Override
    public FiltrosCatalogoDTO obtenerFiltros() {
        return new FiltrosCatalogoDTO(
                Arrays.stream(Deporte.values()).map(d -> new OpcionDeporte(d, d.getEtiqueta(), d.getTallesPelota())).toList(),
                categoriaRepositorio.findAll(Sort.by("nombre")).stream()
                        .map(c -> new OpcionCategoria(c.getId(), c.getNombre(), c.getTipoTalle())).toList(),
                marcaRepositorio.findAll(Sort.by("nombre")).stream()
                        .map(m -> new OpcionMarca(m.getId(), m.getNombre())).toList(),
                // Agrupados por tipo de talle y en su orden lógico dentro de cada tipo
                talleRepositorio.findAll(Sort.by("tipoTalle", "orden")).stream()
                        .map(t -> new OpcionTalle(t.getId(), t.getEtiqueta(), t.getTipoTalle())).toList(),
                productoRepositorio.buscarPrecioMinimoHabilitado(),
                productoRepositorio.buscarPrecioMaximoHabilitado());
    }
}
