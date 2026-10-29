package ar.com.goldenpoint.modelo.entidad;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Valores comerciales que el administrador cambia desde el panel (pestaña Ajustes).
 * Hay una sola fila, siempre con id 1. Los pedidos ya hechos guardan sus propios importes.
 */
@Entity
@Table(name = "ajustes_tienda")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AjustesTienda {

    public static final long ID_UNICO = 1L;

    @Id
    private Long id;

    @Column(name = "costo_envio", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoEnvio;

    // El envío es gratis cuando productos + personalización llegan a este monto
    @Column(name = "envio_gratis_desde", nullable = false, precision = 12, scale = 2)
    private BigDecimal envioGratisDesde;

    // Por cada camiseta con nombre y número
    @Column(name = "recargo_personalizacion", nullable = false, precision = 12, scale = 2)
    private BigDecimal recargoPersonalizacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
