package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoDetalleDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoResumenDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoDTO;
import ar.com.goldenpoint.servicio.IProductoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Catálogo")
@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoControlador {

    private final IProductoServicio productoServicio;

    @Operation(summary = "Lista paginada de productos con filtros opcionales",
            description = "orden: recientes (por defecto), precio_asc, precio_desc o nombre (el precio es el que paga el cliente, con oferta incluida). enOferta=true: solo ofertas. tamanioPagina: 12 por defecto, máximo 48.")
    @GetMapping
    public ResponseEntity<PaginaRespuestaDTO<ProductoResumenDTO>> buscar(@Valid @ModelAttribute FiltroProductoDTO filtro) {
        return ResponseEntity.ok(productoServicio.buscar(filtro));
    }

    @Operation(summary = "Ficha de un producto con la disponibilidad de cada talle")
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDetalleDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoServicio.buscarPorId(id));
    }
}
