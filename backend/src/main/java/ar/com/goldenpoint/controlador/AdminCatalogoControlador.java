package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.CategoriaDTO;
import ar.com.goldenpoint.modelo.dto.respuesta.MarcaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CategoriaSolicitudDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.MarcaSolicitudDTO;
import ar.com.goldenpoint.servicio.IAdminCatalogoServicio;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Marcas y categorías: no se pueden borrar si tienen productos. */
@Tag(name = "Administración: marcas y categorías")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminCatalogoControlador {

    private final IAdminCatalogoServicio adminCatalogoServicio;

    @GetMapping("/marcas")
    public ResponseEntity<List<MarcaDTO>> listarMarcas() {
        return ResponseEntity.ok(adminCatalogoServicio.listarMarcas());
    }

    @PostMapping("/marcas")
    public ResponseEntity<MarcaDTO> crearMarca(@Valid @RequestBody MarcaSolicitudDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCatalogoServicio.crearMarca(dto));
    }

    @PutMapping("/marcas/{id}")
    public ResponseEntity<MarcaDTO> editarMarca(@PathVariable Long id, @Valid @RequestBody MarcaSolicitudDTO dto) {
        return ResponseEntity.ok(adminCatalogoServicio.editarMarca(id, dto));
    }

    @DeleteMapping("/marcas/{id}")
    public ResponseEntity<Void> borrarMarca(@PathVariable Long id) {
        adminCatalogoServicio.borrarMarca(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaDTO>> listarCategorias() {
        return ResponseEntity.ok(adminCatalogoServicio.listarCategorias());
    }

    @PostMapping("/categorias")
    public ResponseEntity<CategoriaDTO> crearCategoria(@Valid @RequestBody CategoriaSolicitudDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCatalogoServicio.crearCategoria(dto));
    }

    @PutMapping("/categorias/{id}")
    public ResponseEntity<CategoriaDTO> editarCategoria(@PathVariable Long id, @Valid @RequestBody CategoriaSolicitudDTO dto) {
        return ResponseEntity.ok(adminCatalogoServicio.editarCategoria(id, dto));
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> borrarCategoria(@PathVariable Long id) {
        adminCatalogoServicio.borrarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
