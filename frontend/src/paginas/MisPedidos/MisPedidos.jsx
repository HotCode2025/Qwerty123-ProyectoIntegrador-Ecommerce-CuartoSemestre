import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { obtenerMisPedidos } from '../../api/pedidos'
import EtiquetaEstado from '../../componentes/EtiquetaEstado/EtiquetaEstado'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { formatearPrecio } from '../../utilidades/formato'
import { formatearFecha } from '../../utilidades/pedidos'
import estilos from './MisPedidos.module.css'

const textoItems = (cantidad) => (cantidad === 1 ? '1 producto' : `${cantidad} productos`)

function MisPedidos() {
  const navegar = useNavigate()
  const { usuario, estaLogueado, cerrarSesion } = useAutenticacion()
  const [estado, setEstado] = useState({ pedidos: null, error: '' })
  const [saliendo, setSaliendo] = useState(false) // cerró sesión: va al inicio, no a ingresar

  useEffect(() => {
    if (!estaLogueado) {
      return
    }
    const controlador = new AbortController()
    obtenerMisPedidos(controlador.signal)
      .then((pedidos) => setEstado({ pedidos, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setEstado({ pedidos: null, error: err.message })
        }
      })
    return () => controlador.abort()
  }, [estaLogueado])

  if (!estaLogueado) {
    return saliendo ? null : <Navigate to="/ingresar" replace state={{ desde: '/mis-pedidos' }} />
  }

  const alSalir = () => {
    setSaliendo(true)
    cerrarSesion()
    navegar('/')
  }

  const { pedidos, error } = estado

  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <h1 className={`display ${estilos.titulo}`}>Mis pedidos</h1>

      <div className={estilos.disposicion}>
        <aside className={estilos.cuenta} aria-label="Mi cuenta">
          <h2 className={`display ${estilos.tituloCuenta}`}>Mi cuenta</h2>
          <p className={estilos.nombre}>
            {usuario.nombre} {usuario.apellido}
          </p>
          <p className="chico">{usuario.email}</p>
          {usuario.telefono && <p className="chico">{usuario.telefono}</p>}
          <button type="button" className={`boton boton-blanco ${estilos.salir}`} onClick={alSalir}>
            Cerrar sesión
          </button>
        </aside>

        <section aria-label="Pedidos" aria-busy={!pedidos && !error}>
          {error && (
            <p className="alerta-error" role="alert">
              {error}
            </p>
          )}

          {!pedidos && !error && (
            <div className={estilos.lista}>
              {[0, 1].map((i) => (
                <div key={i} className={estilos.esqueleto} aria-hidden="true" />
              ))}
            </div>
          )}

          {pedidos?.length === 0 && (
            <div className={estilos.vacio}>
              <p className={`display ${estilos.tituloVacio}`}>Todavía no hiciste pedidos</p>
              <p className={estilos.textoVacio}>Cuando compres algo, lo vas a poder seguir desde acá.</p>
              <Link to="/catalogo" className="boton">
                Ir al catálogo
              </Link>
            </div>
          )}

          {pedidos?.length > 0 && (
            <ul className={estilos.lista}>
              {pedidos.map((pedido, i) => (
                <li key={pedido.id}>
                  <Link to={`/mis-pedidos/${pedido.id}`} className={estilos.pedido} style={{ animationDelay: `${i * 60}ms` }}>
                    <span className={estilos.superiorPedido}>
                      <span className={`display ${estilos.numeroPedido}`}>Pedido #{pedido.id}</span>
                      <EtiquetaEstado estado={pedido.estado} />
                    </span>
                    <span className={estilos.infoPedido}>
                      <span className="chico">
                        {formatearFecha(pedido.fechaCreacion)} · {textoItems(pedido.cantidadItems)}
                      </span>
                      <span className={`display ${estilos.totalPedido}`}>{formatearPrecio(pedido.total)}</span>
                    </span>
                    <span className={estilos.enlacePedido}>Ver detalle →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default MisPedidos
