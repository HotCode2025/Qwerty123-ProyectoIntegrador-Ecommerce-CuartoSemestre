package ar.com.goldenpoint.servicio;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ActualizarStockDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ProductoSolicitudDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IAdminProductoServicio {

    PaginaRespuestaDTO<ProductoAdminDTO> buscar(FiltroProductoAdminDTO filtro);

    ProductoAdminDTO buscarPorId(Long id);

    ProductoAdminDTO crear(ProductoSolicitudDTO dto);

    ProductoAdminDTO editar(Long id, ProductoSolicitudDTO dto);

    /**
     * Elimina un producto que nunca se vendió (con su stock, sus avisos y su foto).
     * Si ya está en algún pedido no se puede borrar: se da de baja editándolo con habilitado=false.
     */
    void eliminar(Long id);

    /** Guarda el stock por talle y avisa a quienes esperaban un talle que vuelve a tener stock. */
    ProductoAdminDTO actualizarStock(Long id, ActualizarStockDTO dto);

    /** Sube o reemplaza la foto del producto (JPG, PNG o WEBP de hasta 3 MB). */
    ProductoAdminDTO actualizarImagen(Long id, MultipartFile archivo);
}
