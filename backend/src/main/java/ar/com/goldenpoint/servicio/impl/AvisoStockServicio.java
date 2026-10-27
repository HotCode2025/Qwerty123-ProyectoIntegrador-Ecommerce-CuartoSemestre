package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.solicitud.AvisoStockSolicitudDTO;
import ar.com.goldenpoint.modelo.entidad.AvisoStock;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.StockProducto;
import ar.com.goldenpoint.repositorio.AvisoStockRepositorio;
import ar.com.goldenpoint.repositorio.ProductoRepositorio;
import ar.com.goldenpoint.servicio.IAvisoStockServicio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvisoStockServicio implements IAvisoStockServicio {

    private final AvisoStockRepositorio avisoStockRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final CorreoServicio correoServicio;
    private final PlantillasCorreo plantillasCorreo;

    @Override
    @Transactional
    public void crear(AvisoStockSolicitudDTO dto) {
        Producto producto = productoRepositorio.findByIdAndHabilitadoTrue(dto.productoId())
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Producto no encontrado"));
        StockProducto stock = producto.getStock().stream()
                .filter(s -> s.getTalle().getId().equals(dto.talleId()))
                .findFirst()
                .orElseThrow(() -> new ExcepcionNegocio("El talle elegido no corresponde a este producto"));
        if (stock.getCantidad() > 0) {
            throw new ExcepcionNegocio("Este talle tiene stock, ya podés comprarlo", HttpStatus.CONFLICT);
        }

        String email = dto.email().trim().toLowerCase(Locale.ROOT);
        if (avisoStockRepositorio.existsByEmailAndProductoIdAndTalleIdAndNotificadoFalse(email, producto.getId(), dto.talleId())) {
            return; // ya estaba anotado: se responde igual para no revelar qué emails pidieron avisos
        }
        avisoStockRepositorio.save(AvisoStock.builder().email(email).producto(producto).talle(stock.getTalle()).build());
    }

    @Override
    @Transactional
    public void notificarReposicion(Long productoId, Long talleId) {
        List<AvisoStock> avisos = avisoStockRepositorio.findByProductoIdAndTalleIdAndNotificadoFalse(productoId, talleId);
        for (AvisoStock aviso : avisos) {
            String html = plantillasCorreo.stockRepuesto(aviso.getProducto(), aviso.getTalle());
            // Si el mail falla queda pendiente y se vuelve a intentar en la próxima reposición
            if (correoServicio.enviar(aviso.getEmail(), null, "¡Volvió tu talle! " + aviso.getProducto().getNombre(), html)) {
                aviso.setNotificado(true);
            }
        }
        if (!avisos.isEmpty()) {
            log.info("Avisos de reposición procesados para producto {} talle {}: {}", productoId, talleId, avisos.size());
        }
    }
}
