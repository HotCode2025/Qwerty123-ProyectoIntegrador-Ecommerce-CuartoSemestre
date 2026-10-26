package ar.com.goldenpoint.modelo.dto.respuesta;

import org.springframework.data.domain.Page;

import java.util.List;

/** Página de resultados con un formato fijo para el frontend (no expone clases internas de Spring). */
public record PaginaRespuestaDTO<T>(List<T> contenido, int pagina, int tamanioPagina, long totalElementos,
                                    int totalPaginas) {

    public static <T> PaginaRespuestaDTO<T> desde(Page<T> pagina) {
        return new PaginaRespuestaDTO<>(pagina.getContent(), pagina.getNumber(), pagina.getSize(),
                pagina.getTotalElements(), pagina.getTotalPages());
    }
}
