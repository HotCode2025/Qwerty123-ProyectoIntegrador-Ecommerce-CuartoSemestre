import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { cambiarEstadoPedido } from '../../api/admin'
import { obtenerPedido } from '../../api/pedidos'
import Avatar from '../../componentes/Avatar/Avatar'
import EtiquetaEstado from '../../componentes/EtiquetaEstado/EtiquetaEstado'
import Icono from '../../componentes/Icono/Icono'
import PasosPedido from '../../componentes/PasosPedido/PasosPedido'
import ResumenCompra from '../../componentes/ResumenCompra/ResumenCompra'
import { formatearPrecio } from '../../utilidades/formato'
import compartidos from './admin.module.css'
import estilos from './AdminDetallePedido.module.css'

// Qué puede hacer el administrador según el estado (mismas reglas que el backend)
const PROXIMO_PASO = {
  PAGADO: { estado: 'EN_PREPARACION', boton: 'Marcar en preparación', texto: 'Armá el pedido y marcalo en preparación. El cliente lo ve en Mis pedidos.', icono: 'paquete' },
  EN_PREPARACION: { estado: 'ENVIADO', boton: 'Marcar enviado', texto: 'Cuando lo despaches, marcalo como enviado.', icono: 'camion' },
  ENVIADO: { estado: 'ENTREGADO', boton: 'Marcar entregado', texto: 'Cuando el cliente lo reciba, marcalo como entregado.', icono: 'tilde' },
}

const TEXTO_FINAL = {
  ENTREGADO: 'Pedido entregado. No quedan pasos pendientes.',
  CANCELADO: 'Pedido cancelado. No se puede volver a activar.',
}

const fechaCompleta = (iso) =>
  new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function AdminDetallePedido() {
  const { id } = useParams()
  const [estado, setEstado] = useState({ id: null, pedido: null, error: null })
  const [guardando, setGuardando] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerPedido(id, controlador.signal)
      .then((pedido) => setEstado({ id, pedido, error: null }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setEstado({ id, pedido: null, error: err })
        }
      })
    return () => controlador.abort()
  }, [id])

  const cargado = estado.id === id
  const { pedido, error } = cargado ? estado : { pedido: null, error: null }

  if (error) {
    return (
      <div className={compartidos.vacio}>
        <p className={`display ${compartidos.tituloVacio}`}>{error.estado === 404 ? 'Pedido no encontrado' : 'No se pudo cargar el pedido'}</p>
        <p className={compartidos.tenue}>{error.estado === 404 ? 'Revisá el número.' : error.message}</p>
        <Link to="/admin" className="boton" style={{ marginTop: 16 }}>
          Volver a pedidos
        </Link>
      </div>
    )
  }

  if (!pedido) {
    return <div className={compartidos.esqueleto} aria-busy="true" />
  }

  const cambiarEstado = (nuevoEstado) => {
    setGuardando(true)
    setErrorAccion('')
    cambiarEstadoPedido(pedido.id, nuevoEstado)
      .then((actualizado) => setEstado({ id, pedido: actualizado, error: null }))
      .catch((err) => setErrorAccion(err.message))
      .finally(() => {
        setGuardando(false)
        setConfirmarCancelacion(false)
      })
  }

  const proximo = PROXIMO_PASO[pedido.estado]
  const { cliente, envio } = pedido

  return (
    <div className={compartidos.pantalla}>
      <p className={compartidos.migas}>
        <Link to="/admin">Panel</Link> / <Link to="/admin">Pedidos</Link> / #{pedido.id}
      </p>
      <div className={estilos.cabecera}>
        <h1 className={`display ${compartidos.titulo}`}>Pedido #{pedido.id}</h1>
        <EtiquetaEstado estado={pedido.estado} />
      </div>
      <p className={compartidos.tenue}>
        Hecho el {fechaCompleta(pedido.fechaCreacion)}
        {pedido.mpPagoId && ` · Pago de Mercado Pago N° ${pedido.mpPagoId}`}
      </p>

      {['PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO'].includes(pedido.estado) && <PasosPedido estado={pedido.estado} />}

      <div className={estilos.accion}>
        {proximo && (
          <>
            <span className={estilos.textoAccion}>
              <Icono nombre={proximo.icono} tamanio={24} />
              <span>
                <strong>Próximo paso</strong>
                <span className={compartidos.chico}>{proximo.texto}</span>
              </span>
            </span>
            <button type="button" className="boton boton-negro" onClick={() => cambiarEstado(proximo.estado)} disabled={guardando}>
              {guardando ? 'Guardando…' : proximo.boton}
              <Icono nombre="flecha" />
            </button>
          </>
        )}

        {pedido.estado === 'PENDIENTE_PAGO' && (
          <>
            <span className={estilos.textoAccion}>
              <Icono nombre="tarjeta" tamanio={24} />
              <span>
                <strong>Esperando el pago</strong>
                <span className={compartidos.chico}>Si el cliente no va a pagar, podés cancelarlo.</span>
              </span>
            </span>
            {confirmarCancelacion ? (
              <span className={estilos.confirmar}>
                <span>¿Cancelar el pedido #{pedido.id}?</span>
                <button type="button" className="boton" onClick={() => cambiarEstado('CANCELADO')} disabled={guardando}>
                  {guardando ? 'Cancelando…' : 'Sí, cancelar'}
                </button>
                <button type="button" className="boton boton-blanco" onClick={() => setConfirmarCancelacion(false)} disabled={guardando}>
                  No
                </button>
              </span>
            ) : (
              <button type="button" className="boton boton-blanco" onClick={() => setConfirmarCancelacion(true)}>
                <Icono nombre="cerrar" /> Cancelar pedido
              </button>
            )}
          </>
        )}

        {TEXTO_FINAL[pedido.estado] && (
          <span className={estilos.textoAccion}>
            <Icono nombre="info" tamanio={24} />
            <strong>{TEXTO_FINAL[pedido.estado]}</strong>
          </span>
        )}
      </div>

      {errorAccion && (
        <p className="alerta-error" role="alert" style={{ marginTop: 12 }}>
          {errorAccion}
        </p>
      )}

      <div className={estilos.disposicion}>
        <div className={estilos.principal}>
          <section className={estilos.caja}>
            <h2 className={`display ${estilos.tituloCaja}`}>
              <Icono nombre="usuario" /> Cliente
            </h2>
            <div className={compartidos.persona}>
              <Avatar id={cliente.id} nombre={cliente.nombre} apellido={cliente.apellido} tamanio={40} />
              <span>
                <strong>
                  {cliente.nombre} {cliente.apellido}
                </strong>
                <span className={compartidos.chico}>
                  {cliente.email} · {envio.telefono}
                </span>
              </span>
            </div>
          </section>

          <section className={estilos.caja}>
            <h2 className={`display ${estilos.tituloCaja}`}>
              <Icono nombre="camiseta" /> Productos
            </h2>
            <ul className={estilos.items}>
              {pedido.items.map((item, i) => (
                <li key={i} className={estilos.item}>
                  <span>
                    <strong>{item.productoNombre}</strong>
                    <span className={compartidos.chico}>
                      Talle {item.talleEtiqueta} · {item.cantidad} × {formatearPrecio(Number(item.precioUnitario) + Number(item.recargoUnitario))}
                    </span>
                    {item.nombrePersonalizado && (
                      <span className={estilos.personalizado}>
                        Estampar: {item.nombrePersonalizado} · {item.numeroPersonalizado}
                      </span>
                    )}
                  </span>
                  <span className={compartidos.dinero}>{formatearPrecio(item.totalLinea)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={estilos.caja}>
            <h2 className={`display ${estilos.tituloCaja}`}>
              <Icono nombre="camion" /> Envío
            </h2>
            <p className={estilos.direccion}>
              {envio.calle}
              <br />
              {envio.ciudad}, {envio.provincia} ({envio.codigoPostal})
              <br />
              Tel. {envio.telefono}
            </p>
            <p className={compartidos.chico}>Indicaciones: {envio.indicaciones ?? '—'}</p>
          </section>
        </div>

        <ResumenCompra titulo="Resumen" cotizacion={pedido} />
      </div>
    </div>
  )
}

export default AdminDetallePedido
