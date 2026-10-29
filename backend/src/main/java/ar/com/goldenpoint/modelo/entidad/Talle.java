package ar.com.goldenpoint.modelo.entidad;

import ar.com.goldenpoint.modelo.enumeracion.TipoTalle;
import jakarta.persistence.*;
import lombok.*;

/** Talle disponible (S, 42, N° 5, Único…). Se carga de antemano y no lo edita el usuario. */
@Entity
@Table(name = "talles", uniqueConstraints = @UniqueConstraint(columnNames = {"tipo_talle", "etiqueta"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Talle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_talle", nullable = false, length = 20)
    private TipoTalle tipoTalle;

    @Column(nullable = false, length = 20)
    private String etiqueta;

    // Orden en el que se muestran los talles (S antes que M, 39 antes que 40)
    @Column(nullable = false)
    private int orden;
}
