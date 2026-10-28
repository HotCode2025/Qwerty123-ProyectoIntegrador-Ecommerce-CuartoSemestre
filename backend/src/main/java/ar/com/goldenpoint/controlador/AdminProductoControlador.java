package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.PaginaRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.ProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ActualizarStockDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.FiltroProductoAdminDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ProductoSolicitudDTO;
import ar.com.goldenpoint.servicio.IAdminProductoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Todo /api/v1/admin/** exige rol ADMIN (ConfiguracionSeguridad)
@Tag(name = "Administración: productos")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/productos")
@RequiredArgsConstructor
public class AdminProductoControlador {

    private final IAdminProductoServicio adminProductoServicio;

    @Operation(summary = "Lista paginada de productos, incluidos los dados de baja, con stock exacto")
    @GetMapping
    public ResponseEntity<PaginaRespuestaDTO<ProductoAdminDTO>> buscar(@Valid @ModelAttribute FiltroProductoAdminDTO filtro) {
        return ResponseEntity.ok(adminProductoServicio.buscar(filtro));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoAdminDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductoServicio.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProductoAdminDTO> crear(@Valid @RequestBody ProductoSolicitudDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductoServicio.crear(dto));
    }

    @Operation(summary = "Edita un producto (con habilitado=true también se vuelve a activar)")
    @PutMapping("/{id}")
    public ResponseEntity<ProductoAdminDTO> editar(@PathVariable Long id, @Valid @RequestBody ProductoSolicitudDTO dto) {
        return ResponseEntity.ok(adminProductoServicio.editar(id, dto));
    }

    @Operation(summary = "Elimina un producto que nunca se vendió",
            description = "Si el producto ya está en pedidos responde 409: en ese caso se da de baja con PUT y habilitado=false.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        adminProductoServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Carga el stock por talle; si un talle vuelve a tener stock, avisa por mail a quienes lo esperaban")
    @PutMapping("/{id}/stock")
    public ResponseEntity<ProductoAdminDTO> actualizarStock(@PathVariable Long id, @Valid @RequestBody ActualizarStockDTO dto) {
        return ResponseEntity.ok(adminProductoServicio.actualizarStock(id, dto));
    }

    @Operation(summary = "Sube o reemplaza la foto del producto (JPG, PNG o WEBP de hasta 3 MB)")
    @PostMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoAdminDTO> actualizarImagen(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(adminProductoServicio.actualizarImagen(id, archivo));
    }
}
