import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router'
import { confirmarPago, obtenerPedido } from '../../api/pedidos'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { useCarrito } from '../../contexto/contextoCarrito'
import { formatearPrecio } from '../../utilidades/formato'
import estilos from './ResultadoPago.module.css'

// Estados de pago de Mercado Pago (vienen en inglés desde su API) que todavía pueden acreditarse
const ESTADOS_EN_REVISION = ['pending', 'in_process', 'authorized']

const PAPELITOS = [
  { izquierda: '10%', color: 'var(--amarillo)', demora: '0s' },
  { izquierda: '28%', color: 'var(--verde)', demora: '.1s' },
  { izquierda: '46%', color: 'var(--naranja)', demora: '.2s' },
  { izquierda: '64%', color: 'var(--celeste)', demora: '.15s' },
  { izquierda: '82%', color: 'var(--amarillo)', demora: '.25s' },
]

/** Traduce la respuesta de /pagos/confirmar a qué pantalla mostrar. */
function desenlaceDe(resultado) {
  if (resultado.estadoPago === 'approved') {
    // Aprobado pero el pedido no avanzó (monto distinto o pedido cancelado): lo revisa la tienda
    return ['PENDIENTE_PAGO', 'CANCELADO'].includes(resultado.estadoPedido) ? 'problema' : 'aprobado'
  }
  return ESTADOS_EN_REVISION.includes(resultado.estadoPago) ? 'pendiente' : 'rechazado'
}

/**
 * Pantalla a la que vuelve Mercado Pago: /pago/resultado?payment_id=123&status=approved&external_reference=45
 * (los parámetros los pone Mercado Pago). El estado real no se toma de la URL: se confirma con el backend,
 * que lo consulta a Mercado Pago.
 */
function ResultadoPago() {
  const ubicacion = useLocation()
  const [parametros] = useSearchParams()
  const { estaLogueado } = useAutenticacion()
  const { vaciar } = useCarrito()
  const [estado, setEstado] = useState({ desenlace: null, pedidoId: null, total: null, error: '' })

  // Si el cliente volvió sin pagar, Mercado Pago manda payment_id=null
  const pagoIdCrudo = parametros.get('payment_id')
  const pagoId = /^\d+$/.test(pagoIdCrudo ?? '') ? pagoIdCrudo : null

  useEffect(() => {
    if (!estaLogueado || !pagoId) {
      return
    }
    const controlador = new AbortController()
    confirmarPago(Number(pagoId), controlador.signal)
      .then((resultado) => {
        const desenlace = desenlaceDe(resultado)
        if (desenlace === 'aprobado' || desenlace === 'pendiente') {
          vaciar() // el pedido ya está hecho: el carrito no se vuelve a usar
        }
        setEstado({ desenlace, pedidoId: resultado.pedidoId, total: null, error: '' })
        return desenlace === 'aprobado' ? obtenerPedido(resultado.pedidoId, controlador.signal) : null
      })
      .then((pedido) => {
        if (pedido) {
          setEstado((anterior) => ({ ...anterior, total: pedido.total }))
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setEstado((anterior) => ({ ...anterior, error: err.message }))
        }
      })
    return () => controlador.abort()
  }, [estaLogueado, pagoId, vaciar])

  if (!estaLogueado) {
    // Por ejemplo, si pagó en otra ventana: después de ingresar vuelve acá con los mismos datos
    return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname + ubicacion.search, motivo: 'resultado' }} />
  }

  const desenlace = pagoId ? estado.desenlace : 'sinPagar'

  if (estado.error && !estado.desenlace) {
    return (
      <Pantalla titulo="¡Uy! No pudimos confirmar tu pago" texto={estado.error}>
        <p className={estilos.texto}>Si ya pagaste, no te preocupes: te avisamos por mail cuando se acredite.</p>
        <Link to="/" className="boton">
          Volver al inicio
        </Link>
      </Pantalla>
    )
  }

  if (!desenlace) {
    return (
      <main className={`contenedor ${estilos.pantalla}`} aria-busy="true">
        <div className={estilos.ruedita} aria-hidden="true" />
        <p className={estilos.texto}>Estamos confirmando tu pago con Mercado Pago…</p>
      </main>
    )
  }

  if (desenlace === 'aprobado') {
    return (
      <main className={`contenedor ${estilos.pantalla}`}>
        <div className={estilos.papelitos} aria-hidden="true">
          {PAPELITOS.map((papelito) => (
            <span key={papelito.izquierda} style={{ left: papelito.izquierda, background: papelito.color, animationDelay: papelito.demora }} />
          ))}
        </div>
        <svg width="104" height="104" viewBox="0 0 52 52" aria-hidden="true">
          <circle className={estilos.circulo} cx="26" cy="26" r="24" fill="#2BB673" stroke="#111111" strokeWidth="3" />
          <path className={estilos.tilde} d="M15 27l7 7 15-15" fill="none" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className={`display ${estilos.titulo}`}>¡Golazo!</h1>
        <p className={estilos.bajada}>
          Pedido #{estado.pedidoId} confirmado
          {estado.total !== null && (
            <>
              {' '}
              · Total pagado <strong>{formatearPrecio(estado.total)}</strong>
            </>
          )}
        </p>
        <p className={estilos.texto}>Te enviamos un mail con el detalle. Podés seguir el estado desde Mis pedidos.</p>
        <div className={estilos.botones}>
          <Link to={`/mis-pedidos/${estado.pedidoId}`} className="boton">
            Ver mi pedido
          </Link>
          <Link to="/catalogo" className="boton boton-blanco">
            Seguir comprando
          </Link>
        </div>
      </main>
    )
  }

  if (desenlace === 'pendiente') {
    return (
      <Pantalla titulo="¡Ya casi!" texto={`Tu pago del pedido #${estado.pedidoId} está en revisión. Te avisamos por mail cuando se acredite.`}>
        <Link to={`/mis-pedidos/${estado.pedidoId}`} className="boton">
          Ver mi pedido
        </Link>
      </Pantalla>
    )
  }

  if (desenlace === 'problema') {
    return (
      <Pantalla titulo="Revisamos tu pedido" texto={`Recibimos el pago del pedido #${estado.pedidoId}, pero hay algo que tenemos que revisar. Te escribimos por mail.`}>
        <Link to="/" className="boton">
          Volver al inicio
        </Link>
      </Pantalla>
    )
  }

  // Rechazado o sin pagar: el carrito sigue guardado para intentarlo de nuevo
  return (
    <Pantalla
      titulo={desenlace === 'sinPagar' ? 'No se completó el pago' : 'El pago no se aprobó'}
      texto="Tu carrito sigue guardado. Podés intentarlo de nuevo con otro medio de pago."
    >
      <Link to="/carrito" className="boton">
        Volver al carrito
      </Link>
    </Pantalla>
  )
}

function Pantalla({ titulo, texto, children }) {
  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <h1 className={`display ${estilos.tituloChico}`}>{titulo}</h1>
      <p className={estilos.texto}>{texto}</p>
      <div className={estilos.botones}>{children}</div>
    </main>
  )
}

export default ResultadoPago
