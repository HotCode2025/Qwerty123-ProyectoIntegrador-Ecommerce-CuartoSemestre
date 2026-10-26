package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.FiltrosCatalogoDTO;
import ar.com.goldenpoint.servicio.ICatalogoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Catálogo")
@RestController
@RequestMapping("/api/v1/catalogo")
@RequiredArgsConstructor
public class CatalogoControlador {

    private final ICatalogoServicio catalogoServicio;

    @Operation(summary = "Deportes, categorías, marcas, talles y rango de precios para armar los filtros")
    @GetMapping("/filtros")
    public ResponseEntity<FiltrosCatalogoDTO> obtenerFiltros() {
        return ResponseEntity.ok(catalogoServicio.obtenerFiltros());
    }
}
