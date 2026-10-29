package ar.com.goldenpoint.modelo.dto.respuesta;

import java.math.BigDecimal;

/** Costo de envío, monto para el envío gratis y recargo de personalización vigentes. */
public record AjustesTiendaDTO(BigDecimal costoEnvio, BigDecimal envioGratisDesde, BigDecimal recargoPersonalizacion) {
}
