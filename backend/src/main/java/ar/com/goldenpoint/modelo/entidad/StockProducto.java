package ar.com.goldenpoint.modelo.entidad;

import jakarta.persistence.*;
import lombok.*;

/** Cantidad disponible de un producto en un talle. */
@Entity
@Table(name = "stock_productos", uniqueConstraints = @UniqueConstraint(columnNames = {"producto_id", "talle_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "talle_id")
    private Talle talle;

    @Column(nullable = false)
    private int cantidad;
}
