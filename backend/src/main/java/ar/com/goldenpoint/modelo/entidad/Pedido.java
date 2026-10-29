package ar.com.goldenpoint.modelo.entidad;

import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Pedido de un cliente. Guarda una copia de los importes y de la dirección de envío
 * para que el pedido no cambie si después cambian los precios o los datos del usuario. */
@Entity
@Table(name = "pedidos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "recargo_personalizacion", nullable = false, precision = 12, scale = 2)
    private BigDecimal recargoPersonalizacion;

    @Column(name = "costo_envio", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoEnvio;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "envio_calle", nullable = false, length = 150)
    private String envioCalle;

    @Column(name = "envio_ciudad", nullable = false, length = 80)
    private String envioCiudad;

    @Column(name = "envio_provincia", nullable = false, length = 60)
    private String envioProvincia;

    @Column(name = "envio_codigo_postal", nullable = false, length = 10)
    private String envioCodigoPostal;

    @Column(name = "envio_telefono", nullable = false, length = 30)
    private String envioTelefono;

    @Column(name = "envio_indicaciones")
    private String envioIndicaciones;

    // Identificadores que devuelve Mercado Pago al crear la preferencia y al aprobar el pago
    @Column(name = "mp_preferencia_id", length = 100)
    private String mpPreferenciaId;

    @Column(name = "mp_pago_id", length = 100)
    private String mpPagoId;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Builder.Default
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> items = new ArrayList<>();
}
