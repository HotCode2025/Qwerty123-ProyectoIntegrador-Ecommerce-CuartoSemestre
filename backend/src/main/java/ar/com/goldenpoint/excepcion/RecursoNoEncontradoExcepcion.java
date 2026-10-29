package ar.com.goldenpoint.excepcion;

import org.springframework.http.HttpStatus;

/** El recurso pedido no existe (o está dado de baja). Responde 404. */
public class RecursoNoEncontradoExcepcion extends ExcepcionNegocio {

    public RecursoNoEncontradoExcepcion(String mensaje) {
        super(mensaje, HttpStatus.NOT_FOUND);
    }
}
