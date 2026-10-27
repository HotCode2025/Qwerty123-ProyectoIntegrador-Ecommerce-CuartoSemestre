package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.modelo.dto.respuesta.CotizacionCarritoDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.CarritoSolicitudDTO;
import ar.com.goldenpoint.servicio.ICarritoServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarritoServicio implements ICarritoServicio {

    private final CalculadoraCarrito calculadoraCarrito;

    @Override
    @Transactional(readOnly = true)
    public CotizacionCarritoDTO cotizar(CarritoSolicitudDTO carrito) {
        return calculadoraCarrito.calcular(carrito.items()).cotizacion();
    }
}
