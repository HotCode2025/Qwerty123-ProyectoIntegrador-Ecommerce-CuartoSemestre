package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.AjustesTiendaDTO;
import ar.com.goldenpoint.servicio.IAjustesTiendaServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Catálogo")
@RestController
@RequestMapping("/api/v1/tienda")
@RequiredArgsConstructor
public class TiendaControlador {

    private final IAjustesTiendaServicio ajustesServicio;

    @Operation(summary = "Costo de envío, monto para el envío gratis y recargo de personalización (los textos de la tienda)")
    @GetMapping("/ajustes")
    public ResponseEntity<AjustesTiendaDTO> obtenerAjustes() {
        return ResponseEntity.ok(ajustesServicio.obtener());
    }
}
