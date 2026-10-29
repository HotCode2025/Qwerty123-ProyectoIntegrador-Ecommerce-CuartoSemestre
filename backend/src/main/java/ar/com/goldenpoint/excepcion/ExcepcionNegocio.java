package ar.com.goldenpoint.excepcion;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Error de una regla del negocio (sin stock, email repetido, etc.) con el estado HTTP a devolver. */
@Getter
public class ExcepcionNegocio extends RuntimeException {

    private final HttpStatus estado;

    public ExcepcionNegocio(String mensaje, HttpStatus estado) {
        super(mensaje);
        this.estado = estado;
    }

    public ExcepcionNegocio(String mensaje) {
        this(mensaje, HttpStatus.BAD_REQUEST);
    }
}
