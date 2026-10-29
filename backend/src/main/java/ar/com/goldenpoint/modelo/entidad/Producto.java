package ar.com.goldenpoint.modelo.entidad;

import ar.com.goldenpoint.modelo.enumeracion.Deporte;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Producto del catálogo. El stock se maneja por talle en {@link StockProducto}. */
@Entity
@Table(name = "productos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    // Con valor, el producto está en oferta y se cobra este precio (siempre menor que el normal)
    @Column(name = "precio_oferta", precision = 12, scale = 2)
    private BigDecimal precioOferta;

    // Precio que paga el cliente, calculado por la base: lo usan el filtro y el orden por precio del catálogo
    @Setter(AccessLevel.NONE)
    @Formula("coalesce(precio_oferta, precio)")
    private BigDecimal precioFinal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Deporte deporte;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "marca_id")
    private Marca marca;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    // Solo las camisetas de fútbol y básquet admiten nombre y número
    @Column(nullable = false)
    private boolean personalizable;

    @Column(nullable = false)
    private boolean destacado;

    // Baja lógica: un producto con pedidos no se borra, se deshabilita
    @Builder.Default
    @Column(nullable = false)
    private boolean habilitado = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Builder.Default
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockProducto> stock = new ArrayList<>();

    /** Precio que se cobra hoy: el de oferta si tiene, si no el normal. */
    public BigDecimal precioVigente() {
        return precioOferta != null ? precioOferta : precio;
    }

    /** Agrega el stock de un talle manteniendo la relación en ambos lados. */
    public void agregarStock(Talle talle, int cantidad) {
        stock.add(StockProducto.builder().producto(this).talle(talle).cantidad(cantidad).build());
    }
}
