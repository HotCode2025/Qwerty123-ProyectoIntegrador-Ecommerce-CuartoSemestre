package ar.com.goldenpoint.modelo.entidad;

import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;
import jakarta.persistence.*;
import lombok.*;

/** Categoría de producto. Define qué tipo de talle usan sus productos. */
@Entity
@Table(name = "categorias")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_talle", nullable = false, length = 20)
    private TipoTalle tipoTalle;
}
