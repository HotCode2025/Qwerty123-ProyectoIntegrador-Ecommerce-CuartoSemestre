package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.MensajeRespuestaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.AvisoStockSolicitudDTO;
import ar.com.goldenpoint.servicio.IAvisoStockServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Catálogo")
@RestController
@RequestMapping("/api/v1/avisos-stock")
@RequiredArgsConstructor
public class AvisoStockControlador {

    private final IAvisoStockServicio avisoStockServicio;

    @Operation(summary = "Avisarme cuando llegue: registra un email para un talle sin stock")
    @PostMapping
    public ResponseEntity<MensajeRespuestaDTO> crear(@Valid @RequestBody AvisoStockSolicitudDTO dto) {
        avisoStockServicio.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MensajeRespuestaDTO("Listo. Te avisamos por mail cuando vuelva a entrar."));
    }
}
