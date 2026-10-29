package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoDTO;

public interface IProductoServicio {

    PaginaRespuestaDTO<ProductoResumenDTO> buscar(FiltroProductoDTO filtro);

    ProductoDetalleDTO buscarPorId(Long id);
}
