package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.CotizacionCarritoDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CarritoSolicitudDTO;
import ar.com.goldenpoint.servicio.ICarritoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Carrito")
@RestController
@RequestMapping("/api/v1/carrito")
@RequiredArgsConstructor
public class CarritoControlador {

    private final ICarritoServicio carritoServicio;

    @Operation(summary = "Cotiza el carrito: precios, recargos, envío y avisos por línea",
            description = "Las líneas con 'problema' no suman al total y 'valida' queda en false.")
    @PostMapping("/cotizacion")
    public ResponseEntity<CotizacionCarritoDTO> cotizar(@Valid @RequestBody CarritoSolicitudDTO carrito) {
        return ResponseEntity.ok(carritoServicio.cotizar(carrito));
    }
}
