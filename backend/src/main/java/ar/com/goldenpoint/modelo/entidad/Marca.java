package ar.com.goldenpoint.modelo.entidad;

import jakarta.persistence.*;
import lombok.*;

/** Marca de los productos (se gestiona desde el panel de administración). */
@Entity
@Table(name = "marcas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;
}
