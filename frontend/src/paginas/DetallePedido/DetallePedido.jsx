import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import { obtenerPedido } from '../../api/pedidos'
import EtiquetaEstado from '../../componentes/EtiquetaEstado/EtiquetaEstado'
import PasosPedido from '../../componentes/PasosPedido/PasosPedido'
import ResumenCompra from '../../componentes/ResumenCompra/ResumenCompra'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { formatearPrecio } from '../../utilidades/formato'
import { formatearFecha } from '../../utilidades/pedidos'
import estilos from './DetallePedido.module.css'

// Mensaje para los estados que no siguen el recorrido normal
const AVISOS = {
  PENDIENTE_PAGO: 'Este pedido todavía no figura como pagado. Si ya pagaste, puede tardar unos minutos en acreditarse.',
  CANCELADO: 'Este pedido fue cancelado. Si tenés dudas, escribinos.',
}

function DetallePedido() {
  const { id } = useParams()
  const ubicacion = useLocation()
  const { estaLogueado } = useAutenticacion()
  const [estado, setEstado] = useState({ id: null, pedido: null, error: null })

  useEffect(() => {
    if (!estaLogueado) {
      return
    }
    const controlador = new AbortController()
    obtenerPedido(id, controlador.signal)
      .then((pedido) => setEstado({ id, pedido, error: null }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setEstado({ id, pedido: null, error: err })
        }
      })
    return () => controlador.abort()
  }, [id, estaLogueado])

  if (!estaLogueado) {
    return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname }} />
  }

  const cargado = estado.id === id
  const { pedido, error } = cargado ? estado : { pedido: null, error: null }

  if (error) {
    const noExiste = error.estado === 404 || error.estado === 400
    return (
      <main className={`contenedor ${estilos.faltante}`}>
        <h1 className={`display ${estilos.tituloFaltante}`}>{noExiste ? 'Pedido no encontrado' : '¡Uy! Algo falló'}</h1>
        <p className={estilos.textoFaltante}>{noExiste ? 'Revisá el número o mirá tu historial.' : error.message}</p>
        <Link to="/mis-pedidos" className="boton">
          Ir a Mis pedidos
        </Link>
      </main>
    )
  }

  if (!pedido) {
    return (
      <main className={`contenedor ${estilos.pantalla}`} aria-busy="true">
        <div className={estilos.esqueleto} />
      </main>
    )
  }

  const aviso = AVISOS[pedido.estado]
  const { envio } = pedido

  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <p className={estilos.migas}>
        <Link to="/mis-pedidos">Mis pedidos</Link> / Pedido #{pedido.id}
      </p>
      <div className={estilos.cabecera}>
        <h1 className={`display ${estilos.titulo}`}>Pedido #{pedido.id}</h1>
        <EtiquetaEstado estado={pedido.estado} />
      </div>
      <p className="chico">Hecho el {formatearFecha(pedido.fechaCreacion)}</p>

      {aviso ? <p className={estilos.aviso}>{aviso}</p> : <PasosPedido estado={pedido.estado} />}

      <div className={estilos.disposicion}>
        <div className={estilos.principal}>
          <section className={estilos.caja} aria-label="Productos">
            <h2 className={`display ${estilos.tituloCaja}`}>Productos</h2>
            <ul className={estilos.items}>
              {pedido.items.map((item, i) => (
                <li key={i} className={estilos.item}>
                  <div>
                    <Link to={`/producto/${item.productoId}`} className={estilos.nombreItem}>
                      {item.productoNombre}
                    </Link>
                    <p className="chico">
                      Talle {item.talleEtiqueta} · {item.cantidad} × {formatearPrecio(Number(item.precioUnitario) + Number(item.recargoUnitario))}
                    </p>
                    {item.nombrePersonalizado && (
                      <p className={`chico ${estilos.personalizado}`}>
                        Personalizada: {item.nombrePersonalizado} · {item.numeroPersonalizado}
                      </p>
                    )}
                  </div>
                  <span className={`display ${estilos.totalItem}`}>{formatearPrecio(item.totalLinea)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={estilos.caja} aria-label="Envío">
            <h2 className={`display ${estilos.tituloCaja}`}>Envío</h2>
            <p className={estilos.direccion}>
              {envio.calle}
              <br />
              {envio.ciudad}, {envio.provincia} ({envio.codigoPostal})
              <br />
              Tel. {envio.telefono}
            </p>
            {envio.indicaciones && <p className="chico">Indicaciones: {envio.indicaciones}</p>}
          </section>
        </div>

        <ResumenCompra titulo="Resumen" cotizacion={pedido} />
      </div>
    </main>
  )
}

export default DetallePedido
