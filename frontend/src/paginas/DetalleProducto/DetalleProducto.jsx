import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { crearAvisoStock, obtenerProducto, obtenerProductos } from '../../api/productos'
import IlustracionProducto from '../../componentes/IlustracionProducto/IlustracionProducto'
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { useCarrito } from '../../contexto/contextoCarrito'
import { formatearPrecio } from '../../utilidades/formato'
import { useAjustesTienda } from '../../contexto/contextoAjustes'
import { limpiarNombrePersonalizado, limpiarNumeroPersonalizado, porcentajeDescuento, precioVigente } from '../../utilidades/tienda'
import { deportePorValor, tipoIlustracion } from '../../utilidades/deportes'
import estilos from './DetalleProducto.module.css'

const CANTIDAD_RELACIONADOS = 4

/** Formulario "Avisarme cuando llegue" para un talle sin stock. */
function CajaAvisoStock({ productoId, talle }) {
  const { usuario } = useAutenticacion()
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const alEnviar = (evento) => {
    evento.preventDefault()
    const email = new FormData(evento.currentTarget).get('email').trim()
    setEnviando(true)
    setError('')
    crearAvisoStock({ email, productoId, talleId: talle.talleId })
      .then((respuesta) => setMensaje(respuesta.mensaje))
      .catch((err) => setError(err.errores?.email ?? err.message))
      .finally(() => setEnviando(false))
  }

  return (
    <div className={`${estilos.caja} ${estilos.cajaAviso}`}>
      <p className={estilos.tituloAviso}>El talle {talle.etiqueta} no tiene stock</p>
      {mensaje ? (
        <p className={estilos.listo} role="status">
          {mensaje}
        </p>
      ) : (
        <form className={estilos.formularioAviso} onSubmit={alEnviar}>
          <label className="solo-lector" htmlFor="email-aviso">
            Tu email
          </label>
          <input
            id="email-aviso"
            name="email"
            className="entrada"
            type="email"
            required
            maxLength={120}
            defaultValue={usuario?.email ?? ''}
            placeholder="nombre@correo.com"
          />
          <button className="boton" type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Avisarme cuando llegue'}
          </button>
        </form>
      )}
      {error && (
        <p className="alerta-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function DetalleProducto({ id }) {
  const navegar = useNavigate()
  const { agregarItem } = useCarrito()
  const { ajustes } = useAjustesTienda()
  const [producto, setProducto] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [errorCarga, setErrorCarga] = useState(null)
  const [talleId, setTalleId] = useState(null) // talle elegido (con stock)
  const [talleAviso, setTalleAviso] = useState(null) // talle sin stock que tocó el cliente
  const [nombrePersonalizado, setNombrePersonalizado] = useState('')
  const [numeroPersonalizado, setNumeroPersonalizado] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()
    obtenerProducto(id, controlador.signal)
      .then((datos) => {
        setProducto(datos)
        // Otros productos del mismo deporte
        return obtenerProductos({ deporte: datos.deporte, tamanioPagina: CANTIDAD_RELACIONADOS + 1 }, controlador.signal)
      })
      .then((pagina) => setRelacionados(pagina.contenido.filter((item) => item.id !== Number(id)).slice(0, CANTIDAD_RELACIONADOS)))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setErrorCarga(err)
        }
      })
    return () => controlador.abort()
  }, [id])

  if (errorCarga && !producto) {
    const noExiste = errorCarga.estado === 404 || errorCarga.estado === 400
    return (
      <main className={`contenedor ${estilos.faltante}`}>
        <h1 className={`display ${estilos.tituloFaltante}`}>{noExiste ? 'Producto no encontrado' : '¡Uy! Algo falló'}</h1>
        <p className={estilos.textoFaltante}>{noExiste ? 'Puede que ya no esté a la venta.' : errorCarga.message}</p>
        <Link to="/catalogo" className="boton">
          Ir al catálogo
        </Link>
      </main>
    )
  }

  if (!producto) {
    return (
      <main className={`contenedor ${estilos.detalle}`} aria-busy="true">
        <div className={estilos.esqueleto} />
        <p className="chico">Cargando producto…</p>
      </main>
    )
  }

  const deporte = deportePorValor(producto.deporte)
  const tienePersonalizacion = producto.personalizable && nombrePersonalizado.trim() !== '' && numeroPersonalizado !== ''
  // Solo para mostrar: el importe que se cobra lo calcula el backend al cotizar
  const recargo = Number(ajustes?.recargoPersonalizacion ?? 0)
  const totalUnitario = Number(precioVigente(producto)) + (tienePersonalizacion ? recargo : 0)

  const elegirTalle = (talle) => {
    setError('')
    if (talle.disponible) {
      setTalleId(talle.talleId)
      setTalleAviso(null)
    } else {
      setTalleId(null)
      setTalleAviso(talle)
    }
  }

  const agregarAlCarrito = () => {
    if (!talleId) {
      setError('Elegí un talle disponible para continuar.')
      return
    }
    if (producto.personalizable && (nombrePersonalizado.trim() === '') !== (numeroPersonalizado === '')) {
      setError('Completá nombre y número, o dejá los dos vacíos.')
      return
    }
    agregarItem({
      productoId: producto.id,
      talleId,
      cantidad: 1,
      nombrePersonalizado: tienePersonalizacion ? nombrePersonalizado.trim() : null,
      numeroPersonalizado: tienePersonalizacion ? Number(numeroPersonalizado) : null,
    })
    navegar('/carrito', { state: { agregado: true } })
  }

  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <p className={estilos.migas}>
        <Link to="/catalogo">Catálogo</Link> / <Link to={`/catalogo?deporte=${deporte.slug}`}>{deporte.etiqueta}</Link> / {producto.categoriaNombre}
      </p>

      <div className={estilos.detalle}>
        <div className={estilos.imagen}>
          {producto.imagenUrl ? (
            <img className={estilos.foto} src={producto.imagenUrl} alt={producto.nombre} />
          ) : (
            <>
              <div className={estilos.puntos} aria-hidden="true" />
              <IlustracionProducto tipo={tipoIlustracion(producto.categoriaNombre)} className={estilos.ilustracion} />
            </>
          )}
          <span className={estilos.etiqueta} style={{ background: deporte.color }}>
            {deporte.etiqueta}
          </span>
        </div>

        <div className={estilos.info}>
          <div>
            <p className={estilos.marca}>
              {producto.marcaNombre} · {producto.categoriaNombre}
            </p>
            <h1 className={`display ${estilos.nombre}`}>{producto.nombre}</h1>
            <span className={estilos.precios}>
              <span className={`display ${estilos.precio}`}>{formatearPrecio(precioVigente(producto))}</span>
              {producto.precioOferta && (
                <>
                  <span className={estilos.precioAnterior}>{formatearPrecio(producto.precio)}</span>
                  <span className={estilos.descuento}>-{porcentajeDescuento(producto.precio, producto.precioOferta)}%</span>
                </>
              )}
            </span>
            {producto.descripcion && <p className={estilos.descripcion}>{producto.descripcion}</p>}
          </div>

          <fieldset className={estilos.grupo}>
            <legend className={estilos.tituloGrupo}>Elegí tu talle</legend>
            <div className={estilos.talles}>
              {producto.talles.map((talle) => {
                const clases = [estilos.talle, !talle.disponible && estilos.talleAgotado, talle.talleId === talleId && estilos.talleActivo]
                return (
                  <button
                    key={talle.talleId}
                    type="button"
                    className={clases.filter(Boolean).join(' ')}
                    onClick={() => elegirTalle(talle)}
                    aria-pressed={talle.talleId === talleId}
                  >
                    {talle.disponible ? talle.etiqueta : `${talle.etiqueta} · Sin stock`}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {talleAviso && <CajaAvisoStock key={talleAviso.talleId} productoId={producto.id} talle={talleAviso} />}

          {producto.personalizable && (
            <fieldset className={`${estilos.caja} ${estilos.grupo}`}>
              <legend className={`${estilos.tituloGrupo} ${estilos.leyendaCaja}`}>Personalización (opcional)</legend>
              <div className={estilos.grillaFormulario}>
                <div className="campo">
                  <label htmlFor="nombre-personalizado">Nombre (hasta 12 letras)</label>
                  <input
                    id="nombre-personalizado"
                    className="entrada"
                    value={nombrePersonalizado}
                    onChange={(evento) => {
                      setNombrePersonalizado(limpiarNombrePersonalizado(evento.target.value))
                      setError('')
                    }}
                    placeholder="ROMERO"
                    autoComplete="off"
                  />
                </div>
                <div className="campo">
                  <label htmlFor="numero-personalizado">Número (1 a 99)</label>
                  <input
                    id="numero-personalizado"
                    className="entrada"
                    value={numeroPersonalizado}
                    onChange={(evento) => {
                      setNumeroPersonalizado(limpiarNumeroPersonalizado(evento.target.value))
                      setError('')
                    }}
                    inputMode="numeric"
                    placeholder="10"
                    autoComplete="off"
                  />
                </div>
              </div>
              <p className={estilos.marcador}>
                {tienePersonalizacion
                  ? `En tu pedido: ${nombrePersonalizado.trim()} · ${numeroPersonalizado}${recargo > 0 ? ` (+${formatearPrecio(recargo)})` : ''}`
                  : 'Tipografía y color fijos: el nombre va en la espalda, sobre el número.'}
              </p>
            </fieldset>
          )}

          {error && (
            <p className="alerta-error" role="alert">
              {error}
            </p>
          )}

          <button type="button" className={`boton ${estilos.botonAgregar}`} onClick={agregarAlCarrito}>
            <span>Agregar al carrito</span>
            <span>{formatearPrecio(totalUnitario)}</span>
          </button>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className={estilos.relacionados}>
          <h2 className={`display ${estilos.tituloRelacionados}`}>Más de {deporte.etiqueta}</h2>
          <div className={estilos.grilla}>
            {relacionados.map((item, i) => (
              <TarjetaProducto key={item.id} producto={item} demora={i * 90} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

// La key hace que al pasar de un producto a otro (desde "Más de…") el estado arranque de cero
function PaginaProducto() {
  const { id } = useParams()
  return <DetalleProducto key={id} id={id} />
}

export default PaginaProducto
