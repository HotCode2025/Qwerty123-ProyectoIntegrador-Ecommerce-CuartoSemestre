package ar.com.goldenpoint.servicio.impl;

import ar.com.goldenpoint.configuracion.PropiedadesMercadoPago;
import ar.com.goldenpoint.evento.PedidoPagadoEvento;
import ar.com.goldenpoint.excepcion.ExcepcionNegocio;
import ar.com.goldenpoint.excepcion.RecursoNoEncontradoExcepcion;
import ar.com.goldenpoint.modelo.dto.respuesta.ResultadoPagoDTO;
import ar.com.goldenpoint.modelo.entidad.ItemPedido;
import ar.com.goldenpoint.modelo.entidad.Pedido;
import ar.com.goldenpoint.modelo.enumeracion.EstadoPedido;
import ar.com.goldenpoint.repositorio.PedidoRepositorio;
import ar.com.goldenpoint.repositorio.StockProductoRepositorio;
import ar.com.goldenpoint.servicio.IPagoServicio;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Integración con Mercado Pago Checkout Pro.
 * Nunca se confía en lo que manda el navegador o el aviso: el estado del pago
 * siempre se consulta directamente a la API de Mercado Pago.
 * Las clases Payment, Preference, etc. son del SDK de Mercado Pago y conservan sus nombres.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PagoServicio implements IPagoServicio {

    private static final String APROBADO = "approved"; // valor que usa la API de Mercado Pago

    private final PedidoRepositorio pedidoRepositorio;
    private final StockProductoRepositorio stockRepositorio;
    private final PropiedadesMercadoPago mp;
    private final ApplicationEventPublisher publicadorEventos;

    @PostConstruct
    void configurarSdk() {
        if (mp.accessToken() == null || mp.accessToken().isBlank()) {
            log.warn("MP_ACCESS_TOKEN no está configurado: no se van a poder generar links de pago");
            return;
        }
        MercadoPagoConfig.setAccessToken(mp.accessToken());
    }

    @Override
    public String crearLinkPago(Pedido pedido) {
        List<PreferenceItemRequest> items = new ArrayList<>();
        for (ItemPedido item : pedido.getItems()) {
            items.add(PreferenceItemRequest.builder()
                    .id(String.valueOf(item.getProducto().getId()))
                    .title(tituloItem(item))
                    .quantity(item.getCantidad())
                    .unitPrice(item.getPrecioUnitario().add(item.getRecargoUnitario()))
                    .currencyId("ARS")
                    .build());
        }
        if (pedido.getCostoEnvio().signum() > 0) {
            items.add(PreferenceItemRequest.builder()
                    .id("envio")
                    .title("Envío a domicilio")
                    .quantity(1)
                    .unitPrice(pedido.getCostoEnvio())
                    .currencyId("ARS")
                    .build());
        }

        String urlResultado = mp.urlFrontend() + "/pago/resultado";
        PreferenceRequest.PreferenceRequestBuilder solicitud = PreferenceRequest.builder()
                .items(items)
                .externalReference(String.valueOf(pedido.getId())) // así se vincula el pago con el pedido
                .statementDescriptor("GOLDENPOINT")
                .backUrls(PreferenceBackUrlsRequest.builder()
                        .success(urlResultado).pending(urlResultado).failure(urlResultado).build());

        // Mercado Pago solo acepta el regreso automático y los avisos hacia URLs públicas con https
        if (urlResultado.startsWith("https://")) {
            solicitud.autoReturn(APROBADO);
        }
        if (mp.urlNotificaciones() != null && mp.urlNotificaciones().startsWith("https://")) {
            solicitud.notificationUrl(mp.urlNotificaciones() + "/api/v1/pagos/webhook");
        }

        try {
            Preference preferencia = new PreferenceClient().create(solicitud.build());
            pedido.setMpPreferenciaId(preferencia.getId());
            return preferencia.getInitPoint();
        } catch (MPApiException e) {
            log.error("Mercado Pago rechazó la preferencia del pedido {}: {}", pedido.getId(), e.getApiResponse().getContent());
            throw pagoNoDisponible();
        } catch (MPException e) {
            log.error("No se pudo crear la preferencia del pedido {}", pedido.getId(), e);
            throw pagoNoDisponible();
        }
    }

    @Override
    @Transactional
    public ResultadoPagoDTO confirmar(Long pagoId, Long usuarioId) {
        return aplicarPago(consultarPago(pagoId), usuarioId);
    }

    @Override
    @Transactional
    public void procesarWebhook(String tipo, String datoId, String firma, String idSolicitud) {
        // Mercado Pago también manda avisos de la orden (merchant_order) y en el formato viejo IPN (topic/id).
        // No se usan: se responde 200 para que no los reintente, sin tocar nada
        if (!"payment".equals(tipo) || datoId == null || !datoId.matches("\\d+")) {
            log.debug("Aviso de Mercado Pago ignorado (type {}, data.id {})", tipo, datoId);
            return;
        }
        if (firmaValida(datoId, firma, idSolicitud)) {
            log.info("Aviso de Mercado Pago aceptado: pago {}", datoId);
        } else {
            // Los pagos hechos con usuarios de prueba pueden llegar firmados con otra clave. No es un riesgo:
            // del aviso solo se usa el número; estado, monto y pedido se le consultan a Mercado Pago con el Access Token
            log.warn("Aviso de Mercado Pago con firma que no coincide (data.id {}, x-request-id {}): "
                    + "se verifica consultando el pago a Mercado Pago", datoId, idSolicitud);
        }
        aplicarPago(consultarPago(Long.valueOf(datoId)), null);
    }

    /**
     * Marca el pedido como pagado y descuenta el stock, una sola vez.
     * usuarioId null significa que lo llama el webhook (no hay usuario logueado).
     */
    private ResultadoPagoDTO aplicarPago(Payment pago, Long usuarioId) {
        Pedido pedido = leerIdPedido(pago.getExternalReference())
                .flatMap(pedidoRepositorio::buscarParaActualizar)
                .filter(p -> usuarioId == null || p.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("Pago no encontrado"));

        if (APROBADO.equals(pago.getStatus()) && pedido.getEstado() == EstadoPedido.PENDIENTE_PAGO) {
            if (pago.getTransactionAmount() == null || pago.getTransactionAmount().compareTo(pedido.getTotal()) < 0) {
                log.error("El pago {} no cubre el total del pedido {}: no se marca como pagado", pago.getId(), pedido.getId());
            } else {
                pedido.setEstado(EstadoPedido.PAGADO);
                pedido.setMpPagoId(String.valueOf(pago.getId()));
                descontarStock(pedido);
                publicadorEventos.publishEvent(new PedidoPagadoEvento(pedido.getId())); // mail de confirmación
                log.info("Pedido {} pagado con el pago {}", pedido.getId(), pago.getId());
            }
        } else if (APROBADO.equals(pago.getStatus()) && pedido.getEstado() == EstadoPedido.CANCELADO) {
            // El cliente pagó un link viejo después de que el administrador canceló el pedido
            log.warn("Se aprobó el pago {} de un pedido cancelado ({}): hay que devolver el dinero desde Mercado Pago",
                    pago.getId(), pedido.getId());
        }
        return new ResultadoPagoDTO(pedido.getId(), pago.getStatus(), pedido.getEstado());
    }

    private void descontarStock(Pedido pedido) {
        for (ItemPedido item : pedido.getItems()) {
            stockRepositorio.buscarParaActualizar(item.getProducto().getId(), item.getTalle().getId()).ifPresent(stock -> {
                if (stock.getCantidad() < item.getCantidad()) {
                    // Se pagó pero el stock se agotó mientras tanto: lo resuelve el administrador
                    log.warn("Stock insuficiente al confirmar el pedido {}: {} talle {} (había {}, se pagaron {})",
                            pedido.getId(), item.getProducto().getNombre(), item.getTalle().getEtiqueta(),
                            stock.getCantidad(), item.getCantidad());
                }
                stock.setCantidad(Math.max(0, stock.getCantidad() - item.getCantidad()));
            });
        }
    }

    private Payment consultarPago(Long pagoId) {
        try {
            return new PaymentClient().get(pagoId);
        } catch (MPApiException e) {
            if (e.getStatusCode() == 404) {
                throw new RecursoNoEncontradoExcepcion("Pago no encontrado");
            }
            log.error("Mercado Pago respondió un error al consultar el pago {}: {}", pagoId, e.getApiResponse().getContent());
            throw pagoNoDisponible();
        } catch (MPException e) {
            log.error("No se pudo consultar el pago {}", pagoId, e);
            throw pagoNoDisponible();
        }
    }

    /**
     * Revisa la firma del aviso (header x-signature: "ts=...,v1=...").
     * Firma esperada: HMAC-SHA256 de "id:{data.id};request-id:{x-request-id};ts:{ts};" con la clave secreta.
     * Sin los headers de la firma no es un aviso de Mercado Pago y se rechaza (401); si la firma
     * no coincide devuelve false y el pago igual se confirma consultándolo a Mercado Pago.
     */
    private boolean firmaValida(String datoId, String firma, String idSolicitud) {
        // El motivo queda en los logs (nunca la clave ni la firma) para poder diagnosticar los rechazos
        if (firma == null || idSolicitud == null || datoId == null) {
            log.warn("Aviso de Mercado Pago rechazado: falta {}{}{}", firma == null ? "x-signature " : "",
                    idSolicitud == null ? "x-request-id " : "", datoId == null ? "data.id" : "");
            throw avisoInvalido();
        }
        String ts = null;
        String v1 = null;
        for (String parte : firma.split(",")) {
            String[] claveValor = parte.trim().split("=", 2);
            if (claveValor.length == 2 && claveValor[0].equals("ts")) ts = claveValor[1];
            if (claveValor.length == 2 && claveValor[0].equals("v1")) v1 = claveValor[1];
        }
        if (ts == null || v1 == null) {
            log.warn("Aviso de Mercado Pago rechazado: x-signature no trae ts y v1");
            throw avisoInvalido();
        }
        // Al pegar la clave en el panel del deploy es fácil que se cuele un espacio o un salto de línea
        String clave = mp.claveWebhook() == null ? "" : mp.claveWebhook().strip();
        if (clave.isEmpty()) {
            log.warn("Se recibió un aviso de Mercado Pago pero MP_WEBHOOK_SECRET no está configurado");
            return false;
        }
        String manifiesto = "id:" + datoId.toLowerCase(Locale.ROOT) + ";request-id:" + idSolicitud + ";ts:" + ts + ";";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(clave.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] esperada = HexFormat.of().formatHex(mac.doFinal(manifiesto.getBytes(StandardCharsets.UTF_8)))
                    .getBytes(StandardCharsets.UTF_8);
            // Comparación en tiempo constante para no dar pistas sobre la firma correcta
            return MessageDigest.isEqual(esperada, v1.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("No se pudo verificar la firma del aviso", e);
        }
    }

    private static String tituloItem(ItemPedido item) {
        String titulo = item.getProducto().getNombre() + " · Talle " + item.getTalle().getEtiqueta();
        if (item.getNombrePersonalizado() != null) {
            titulo += " · " + item.getNombrePersonalizado() + " " + item.getNumeroPersonalizado();
        }
        return titulo;
    }

    private static Optional<Long> leerIdPedido(String referenciaExterna) {
        if (referenciaExterna == null || !referenciaExterna.matches("\\d+")) {
            return Optional.empty();
        }
        return Optional.of(Long.valueOf(referenciaExterna));
    }

    private static ExcepcionNegocio pagoNoDisponible() {
        return new ExcepcionNegocio("No se pudo conectar con Mercado Pago. Intentá de nuevo en unos minutos.",
                HttpStatus.BAD_GATEWAY);
    }

    private static ExcepcionNegocio avisoInvalido() {
        return new ExcepcionNegocio("Aviso de pago no válido", HttpStatus.UNAUTHORIZED);
    }
}
