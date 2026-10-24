package ar.com.goldenpoint.modelo.entidad;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/** Línea de un pedido. Si la camiseta está personalizada, guarda el nombre y el número. */
@Entity
@Table(name = "items_pedido")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "talle_id")
    private Talle talle;

    @Column(nullable = false)
    private int cantidad;

    // Precio y recargo al momento de la compra
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "recargo_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal recargoUnitario;

    @Column(name = "nombre_personalizado", length = 12)
    private String nombrePersonalizado;

    @Column(name = "numero_personalizado")
    private Integer numeroPersonalizado;
}
