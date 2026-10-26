package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoDTO;
import ar.com.goldenpoint.modelo.enumeracion.OrdenProducto;
import ar.com.goldenpoint.modelo.mapeador.ProductoMapeador;
import ar.com.goldenpoint.repositorio.EspecificacionesProducto;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.servicio.IProductoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // el mapeador lee relaciones (marca, categoría, stock) dentro de la transacción
public class ProductoServicio implements IProductoServicio {

    private final ProductoRepositorio productoRepositorio;
    private final ProductoMapeador productoMapeador;

    @Override
    public PaginaRespuestaDTO<ProductoResumenDTO> buscar(FiltroProductoDTO filtro) {
        PageRequest paginacion = PageRequest.of(filtro.paginaOPorDefecto(), filtro.tamanioPaginaOPorDefecto(),
                OrdenProducto.desde(filtro.orden()).getOrden());
        return PaginaRespuestaDTO.desde(productoRepositorio
                .findAll(EspecificacionesProducto.desdeFiltro(filtro), paginacion)
                .map(productoMapeador::aResumen));
    }

    @Override
    public ProductoDetalleDTO buscarPorId(Long id) {
        return productoRepositorio.findByIdAndHabilitadoTrue(id)
                .map(productoMapeador::aDetalle)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado"));
    }
}
