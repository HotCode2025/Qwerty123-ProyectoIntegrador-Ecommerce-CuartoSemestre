package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Guarda las fotos de productos en Cloudinary.
 * Cada producto tiene una sola foto con un id fijo, así al cambiarla se reemplaza la anterior
 * (no se acumulan archivos). La URL que se guarda ya pide formato y calidad automáticos y 800 px,
 * para que el catálogo cargue rápido con datos móviles (brief, punto 4).
 */
@Slf4j
@Service
public class AlmacenImagenesServicio {

    private final Cloudinary cloudinary;

    public AlmacenImagenesServicio(@Value("${golden-point.cloudinary-url}") String urlCloudinary) {
        this.cloudinary = urlCloudinary == null || urlCloudinary.isBlank() ? null : new Cloudinary(urlCloudinary);
        if (cloudinary == null) {
            log.warn("CLOUDINARY_URL no está configurado: no se van a poder subir fotos de productos");
        }
    }

    /**
     * Borra la foto de un producto eliminado. Si Cloudinary falla solo se registra:
     * el producto ya no existe y una foto huérfana no afecta a la tienda.
     */
    public void borrarImagenProducto(Long productoId) {
        if (cloudinary == null) {
            return;
        }
        try {
            cloudinary.uploader().destroy(idPublico(productoId), ObjectUtils.asMap("invalidate", true));
        } catch (Exception e) {
            log.warn("No se pudo borrar de Cloudinary la foto del producto {}", productoId, e);
        }
    }

    /** Sube (o reemplaza) la foto del producto y devuelve la URL optimizada para mostrarla. */
    @SuppressWarnings("unchecked")
    public String subirImagenProducto(Long productoId, byte[] imagen) {
        if (cloudinary == null) {
            throw new ExcepcionNegocio("La subida de fotos no está configurada", HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            // Las claves del mapa ("public_id", "overwrite"…) son las que define la API de Cloudinary
            Map<String, Object> resultado = cloudinary.uploader().upload(imagen, ObjectUtils.asMap(
                    "public_id", idPublico(productoId),
                    "overwrite", true,
                    "invalidate", true, // borra de la caché de Cloudinary la foto anterior
                    "resource_type", "image",
                    // Se guarda como máximo a 1200 px para no ocupar espacio de más
                    "transformation", new Transformation<>().width(1200).height(1200).crop("limit")));
            return cloudinary.url()
                    .secure(true)
                    .version(resultado.get("version"))
                    .transformation(new Transformation<>().width(800).crop("limit").quality("auto").fetchFormat("auto"))
                    .generate((String) resultado.get("public_id"));
        } catch (Exception e) {
            log.error("No se pudo subir la foto del producto {} a Cloudinary", productoId, e);
            throw new ExcepcionNegocio("No se pudo subir la foto. Intentá de nuevo en unos minutos.", HttpStatus.BAD_GATEWAY);
        }
    }

    // Id fijo de la foto de cada producto en Cloudinary (se mantiene igual que antes para no perder las fotos subidas)
    private static String idPublico(Long productoId) {
        return "golden-point/products/product-" + productoId;
    }
}
