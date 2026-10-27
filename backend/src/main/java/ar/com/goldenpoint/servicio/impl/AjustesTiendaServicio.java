package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.configuracion.PropiedadesTienda;
import ar.com.goldenpoint.modelo.dto.respuesta.AjustesTiendaDTO;
import ar.com.goldenpoint.modelo.dto.solicitud.AjustesTiendaSolicitudDTO;
import ar.com.goldenpoint.modelo.entidad.AjustesTienda;
import ar.com.goldenpoint.repositorio.AjustesTiendaRepositorio;
import ar.com.goldenpoint.servicio.IAjustesTiendaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AjustesTiendaServicio implements IAjustesTiendaServicio {

    private final AjustesTiendaRepositorio ajustesRepositorio;
    private final PropiedadesTienda valoresIniciales;

    @Override
    @Transactional(readOnly = true)
    public AjustesTiendaDTO obtener() {
        // CargadorDatos crea la fila al arrancar; si faltara, rigen los valores de application.yml
        return ajustesRepositorio.findById(AjustesTienda.ID_UNICO)
                .map(AjustesTiendaServicio::aDTO)
                .orElseGet(() -> new AjustesTiendaDTO(valoresIniciales.costoEnvio(), valoresIniciales.envioGratisDesde(),
                        valoresIniciales.recargoPersonalizacion()));
    }

    @Override
    @Transactional
    public AjustesTiendaDTO actualizar(AjustesTiendaSolicitudDTO dto) {
        AjustesTienda ajustes = ajustesRepositorio.findById(AjustesTienda.ID_UNICO)
                .orElseGet(() -> AjustesTienda.builder().id(AjustesTienda.ID_UNICO).build());
        ajustes.setCostoEnvio(dto.costoEnvio());
        ajustes.setEnvioGratisDesde(dto.envioGratisDesde());
        ajustes.setRecargoPersonalizacion(dto.recargoPersonalizacion());
        return aDTO(ajustesRepositorio.save(ajustes));
    }

    private static AjustesTiendaDTO aDTO(AjustesTienda ajustes) {
        return new AjustesTiendaDTO(ajustes.getCostoEnvio(), ajustes.getEnvioGratisDesde(), ajustes.getRecargoPersonalizacion());
    }
}
