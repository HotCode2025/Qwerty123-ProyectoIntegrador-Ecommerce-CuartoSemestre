package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.AjustesTiendaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.AjustesTiendaSolicitudDTO;
import ar.com.goldenpoint.servicio.IAjustesTiendaServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Pestaña Ajustes del panel: los cambios rigen para las próximas cotizaciones y pedidos. */
@Tag(name = "Administración: ajustes")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/ajustes")
@RequiredArgsConstructor
public class AdminAjustesControlador {

    private final IAjustesTiendaServicio ajustesServicio;

    @GetMapping
    public ResponseEntity<AjustesTiendaDTO> obtener() {
        return ResponseEntity.ok(ajustesServicio.obtener());
    }

    @Operation(summary = "Cambia el costo de envío, el monto para el envío gratis y el recargo de personalización")
    @PutMapping
    public ResponseEntity<AjustesTiendaDTO> actualizar(@Valid @RequestBody AjustesTiendaSolicitudDTO dto) {
        return ResponseEntity.ok(ajustesServicio.actualizar(dto));
    }
}
