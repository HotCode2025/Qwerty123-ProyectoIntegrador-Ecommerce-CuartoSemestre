package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.configuracion.PropiedadesCorreo;
import ar.com.goldenpoint.modelo.entidad.ItemPedido;
import ar.com.goldenpoint.modelo.entidad.Pedido;
import ar.com.goldenpoint.modelo.entidad.Producto;
import ar.com.goldenpoint.modelo.entidad.Talle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

import static org.springframework.web.util.HtmlUtils.htmlEscape;

/**
 * Arma el HTML de los mails con los colores del sitio (negro, dorado y verde).
 * Todo dato que carga un usuario (nombres, dirección) se escapa con htmlEscape.
 */
@Component
@RequiredArgsConstructor
public class PlantillasCorreo {

    private static final Locale ARGENTINA = Locale.forLanguageTag("es-AR");

    private final PropiedadesCorreo correo;

    public String pedidoConfirmado(Pedido pedido) {
        StringBuilder filas = new StringBuilder();
        for (ItemPedido item : pedido.getItems()) {
            String detalle = "Talle " + item.getTalle().getEtiqueta();
            if (item.getNombrePersonalizado() != null) {
                detalle += " · " + item.getNombrePersonalizado() + " " + item.getNumeroPersonalizado();
            }
            BigDecimal totalLinea = item.getPrecioUnitario().add(item.getRecargoUnitario())
                    .multiply(BigDecimal.valueOf(item.getCantidad()));
            filas.append("""
                    <tr><td style="padding:10px 0;border-bottom:1px solid #eee">
                      <strong>%s</strong> x%d<br><span style="color:#555;font-size:14px">%s</span></td>
                    <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">%s</td></tr>
                    """.formatted(htmlEscape(item.getProducto().getNombre()), item.getCantidad(), htmlEscape(detalle),
                    plata(totalLinea)));
        }
        String contenido = """
                <h1 style="margin:0 0 8px;font-size:28px">¡Pedido confirmado!</h1>
                <p style="margin:0 0 20px">Hola %s, recibimos tu pago del pedido <strong>#%d</strong>. Ya lo estamos preparando para el envío.</p>
                <table style="width:100%%;border-collapse:collapse;font-size:15px">%s</table>
                <table style="width:100%%;margin-top:12px;font-size:15px">
                  <tr><td>Subtotal</td><td style="text-align:right">%s</td></tr>
                  <tr><td>Personalización</td><td style="text-align:right">%s</td></tr>
                  <tr><td>Envío</td><td style="text-align:right">%s</td></tr>
                  <tr><td style="padding-top:8px;font-size:20px"><strong>Total</strong></td>
                      <td style="padding-top:8px;font-size:20px;text-align:right"><strong>%s</strong></td></tr>
                </table>
                <p style="margin:24px 0 4px"><strong>Lo enviamos a:</strong></p>
                <p style="margin:0;color:#555">%s, %s, %s (%s)</p>
                %s
                """.formatted(htmlEscape(pedido.getUsuario().getNombre()), pedido.getId(), filas,
                plata(pedido.getSubtotal()), plata(pedido.getRecargoPersonalizacion()),
                pedido.getCostoEnvio().signum() == 0 ? "Gratis" : plata(pedido.getCostoEnvio()), plata(pedido.getTotal()),
                htmlEscape(pedido.getEnvioCalle()), htmlEscape(pedido.getEnvioCiudad()), htmlEscape(pedido.getEnvioProvincia()),
                htmlEscape(pedido.getEnvioCodigoPostal()),
                boton("Ver mi pedido", correo.urlFrontend() + "/mis-pedidos/" + pedido.getId()));
        return plantilla(contenido);
    }

    public String stockRepuesto(Producto producto, Talle talle) {
        String contenido = """
                <h1 style="margin:0 0 8px;font-size:28px">¡Volvió tu talle!</h1>
                <p style="margin:0 0 20px">El producto que estabas esperando ya tiene stock:</p>
                <p style="margin:0;font-size:20px"><strong>%s</strong></p>
                <p style="margin:4px 0 0;color:#555">Talle %s · %s</p>
                <p style="margin:16px 0 0;color:#555;font-size:14px">Las unidades son limitadas: el stock no se reserva hasta que completás la compra.</p>
                %s
                """.formatted(htmlEscape(producto.getNombre()), htmlEscape(talle.getEtiqueta()), plata(producto.getPrecio()),
                boton("Ver producto", correo.urlFrontend() + "/producto/" + producto.getId()));
        return plantilla(contenido);
    }

    private String plantilla(String contenido) {
        return """
                <div style="background:#f4f4f0;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111">
                  <div style="max-width:560px;margin:0 auto;background:#fff;border:3px solid #111;border-radius:18px;overflow:hidden">
                    <div style="background:#111;color:#FFC933;padding:18px 24px;font-size:22px;font-weight:bold">Golden Point</div>
                    <div style="padding:24px">%s</div>
                    <div style="background:#FFC933;padding:12px 24px;font-size:13px">Fútbol · Básquet · Pádel — Envío gratis desde $100.000</div>
                  </div>
                </div>
                """.formatted(contenido);
    }

    private String boton(String texto, String url) {
        return """
                <p style="margin:28px 0 0"><a href="%s" style="display:inline-block;background:#2BB673;color:#111;\
                text-decoration:none;font-weight:bold;padding:12px 22px;border:3px solid #111;border-radius:12px">%s</a></p>
                """.formatted(htmlEscape(url), texto);
    }

    private String plata(BigDecimal valor) {
        NumberFormat formato = NumberFormat.getCurrencyInstance(ARGENTINA);
        formato.setMaximumFractionDigits(0);
        return htmlEscape(formato.format(valor));
    }
}
