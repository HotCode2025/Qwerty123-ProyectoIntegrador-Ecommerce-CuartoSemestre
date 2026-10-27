package ar.com.goldenpoint.controlador;

import ar.com.goldenpoint.modelo.dto.respuesta.ResultadoPagoDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.ConfirmarPagoDTO;
import ar.com.goldenpoint.servicio.IPagoServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Pagos")
@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
public class PagoControlador {

    private final IPagoServicio pagoServicio;

    @Operation(summary = "Confirma un pago con el payment_id que devuelve Mercado Pago al volver al sitio")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/confirmar")
    public ResponseEntity<ResultadoPagoDTO> confirmar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ConfirmarPagoDTO dto) {
        return ResponseEntity.ok(pagoServicio.confirmar(dto.pagoId(), Long.valueOf(jwt.getSubject())));
    }

    // Lo llama Mercado Pago (no el frontend) con ?type=payment&data.id=123 y los headers de firma:
    // esos nombres los define Mercado Pago, por eso quedan en inglés
    @Operation(summary = "Aviso automático de Mercado Pago (webhook)")
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestParam(name = "type", required = false) String tipo,
                                        @RequestParam(name = "data.id", required = false) String datoId,
                                        @RequestHeader(name = "x-signature", required = false) String firma,
                                        @RequestHeader(name = "x-request-id", required = false) String idSolicitud) {
        pagoServicio.procesarWebhook(tipo, datoId, firma, idSolicitud);
        return ResponseEntity.ok().build();
    }
}
