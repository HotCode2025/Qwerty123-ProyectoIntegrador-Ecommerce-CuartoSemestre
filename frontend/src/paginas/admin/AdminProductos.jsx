import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { obtenerProductosAdmin } from '../../api/admin'
import Icono from '../../componentes/Icono/Icono'
import IlustracionProducto from '../../componentes/IlustracionProducto/IlustracionProducto'
import Paginador from '../../componentes/Paginador/Paginador'
import { formatearPrecio } from '../../utilidades/formato'
import { deportePorValor, tipoIlustracion } from '../../utilidades/deportes'
import estilos from './admin.module.css'
import DialogoEliminarProducto from './DialogoEliminarProducto'
import propios from './AdminProductos.module.css'

const TAMANIO_PAGINA = 20
const COLUMNAS = 'minmax(0, 2.4fr) 100px 110px 130px 156px'

// Filtro por estado (?estado=baja). habilitado es lo que espera el backend
const FILTROS = [
  { clave: 'activos', etiqueta: 'Activos', habilitado: true },
  { clave: 'baja', etiqueta: 'De baja', habilitado: false },
  { clave: 'todos', etiqueta: 'Todos', habilitado: null },
]

const textoTalles = (cantidad) => (cantidad === 1 ? '1 talle sin stock' : `${cantidad} talles sin stock`)

function AdminProductos() {
  const [parametros, setParametros] = useSearchParams()
  const [lista, setLista] = useState({ clave: null, datos: null, error: '' })
  const [contadores, setContadores] = useState({})
  const ubicacion = useLocation()
  const [eliminando, setEliminando] = useState(null) // producto con el cartel de eliminar abierto
  // Aviso verde: lo que se hizo acá o lo que llega desde la pantalla de edición
  const [aviso, setAviso] = useState(ubicacion.state?.eliminado ? `Se eliminó "${ubicacion.state.eliminado}".` : '')

  const filtro = FILTROS.find((f) => f.clave === parametros.get('estado')) ?? FILTROS[0]
  const busqueda = parametros.get('q') ?? ''
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1)
  const clave = JSON.stringify({ habilitado: filtro.habilitado, busqueda, pagina })

  useEffect(() => {
    const controlador = new AbortController()
    const consulta = JSON.parse(clave)
    obtenerProductosAdmin(
      { habilitado: consulta.habilitado, busqueda: consulta.busqueda, pagina: consulta.pagina - 1, tamanioPagina: TAMANIO_PAGINA },
      controlador.signal,
    )
      .then((datos) => setLista({ clave, datos, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setLista((anterior) => ({ clave, datos: anterior.datos, error: err.message }))
        }
      })
    return () => controlador.abort()
  }, [clave])

  // Cantidad de activos y de baja para los filtros (solo el total, de a un producto)
  useEffect(() => {
    const controlador = new AbortController()
    Promise.all([true, false].map((habilitado) => obtenerProductosAdmin({ habilitado, tamanioPagina: 1 }, controlador.signal)))
      .then(([activos, deBaja]) => setContadores({ activos: activos.totalElementos, baja: deBaja.totalElementos }))
      .catch(() => {})
    return () => controlador.abort()
  }, [])

  const cambiarParametros = (cambios) => {
    const nuevos = new URLSearchParams(parametros)
    Object.entries(cambios).forEach(([nombre, valor]) => (valor ? nuevos.set(nombre, valor) : nuevos.delete(nombre)))
    if (!('pagina' in cambios)) {
      nuevos.delete('pagina')
    }
    setParametros(nuevos)
  }

  const alBuscar = (evento) => {
    evento.preventDefault()
    cambiarParametros({ q: new FormData(evento.currentTarget).get('q').trim() })
  }

  const cambiarLista = (cambio) => setLista((anterior) => ({ ...anterior, datos: cambio(anterior.datos) }))

  const alEliminar = (producto) => {
    cambiarLista((datos) => ({ ...datos, contenido: datos.contenido.filter((p) => p.id !== producto.id), totalElementos: datos.totalElementos - 1 }))
    setContadores((anteriores) => {
      const grupo = producto.habilitado ? 'activos' : 'baja'
      return anteriores[grupo] === undefined ? anteriores : { ...anteriores, [grupo]: anteriores[grupo] - 1 }
    })
    setEliminando(null)
    setAviso(`Se eliminó "${producto.nombre}".`)
  }

  const alDarDeBaja = (actualizado) => {
    cambiarLista((datos) => ({ ...datos, contenido: datos.contenido.map((p) => (p.id === actualizado.id ? actualizado : p)) }))
    setContadores((anteriores) => (anteriores.activos === undefined ? anteriores : { activos: anteriores.activos - 1, baja: anteriores.baja + 1 }))
    setEliminando(null)
    setAviso(`"${actualizado.nombre}" quedó dado de baja.`)
  }

  const cargando = lista.clave !== clave
  const datos = lista.datos
  const error = cargando ? '' : lista.error

  return (
    <div className={estilos.pantalla}>
      <p className={estilos.migas}>Panel / Productos</p>
      <div className={estilos.cabecera}>
        <h1 className={`display ${estilos.titulo}`}>Productos</h1>
        <Link to="/admin/productos/nuevo" className="boton">
          <Icono nombre="mas" /> Nuevo producto
        </Link>
      </div>

      <div className={propios.barraHerramientas}>
        <form className={estilos.busqueda} onSubmit={alBuscar} role="search">
          <label className="solo-lector" htmlFor="busqueda-productos">
            Buscar productos
          </label>
          <Icono nombre="buscar" className={estilos.iconoBusqueda} />
          <input key={busqueda} id="busqueda-productos" name="q" className="entrada" type="search" defaultValue={busqueda} maxLength={60} placeholder="Buscar por nombre" />
        </form>
        <div className={estilos.fichas} role="group" aria-label="Filtrar por estado" style={{ marginBottom: 0 }}>
          {FILTROS.map((opcion) => (
            <button
              key={opcion.clave}
              type="button"
              className={opcion.clave === filtro.clave ? `${estilos.ficha} ${estilos.fichaActiva}` : estilos.ficha}
              aria-pressed={opcion.clave === filtro.clave}
              onClick={() => cambiarParametros({ estado: opcion.clave === 'activos' ? null : opcion.clave })}
            >
              {opcion.etiqueta}
              {contadores[opcion.clave] !== undefined && ` · ${contadores[opcion.clave]}`}
            </button>
          ))}
        </div>
      </div>

      {aviso && (
        <p className={propios.aviso} role="status">
          <Icono nombre="tilde" tamanio={16} /> {aviso}
          <button type="button" className={propios.cerrarAviso} onClick={() => setAviso('')} aria-label="Cerrar aviso">
            <Icono nombre="cerrar" tamanio={14} />
          </button>
        </p>
      )}

      {error && (
        <p className="alerta-error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      {!datos && !error && <div className={estilos.esqueleto} aria-hidden="true" />}

      {datos?.contenido.length === 0 && (
        <div className={estilos.vacio}>
          <p className={`display ${estilos.tituloVacio}`}>No hay productos acá</p>
          <p className={estilos.tenue}>{busqueda ? `Nada coincide con "${busqueda}".` : 'Probá con otro filtro.'}</p>
        </div>
      )}

      {datos?.contenido.length > 0 && (
        <div className={cargando ? `${estilos.tabla} ${estilos.cargando}` : estilos.tabla} style={{ '--columnas': COLUMNAS }}>
          <div className={estilos.cabeceraFila}>
            <span>Producto</span>
            <span>Deporte</span>
            <span>Precio</span>
            <span>Stock</span>
            <span />
          </div>
          {datos.contenido.map((producto) => {
            const deporte = deportePorValor(producto.deporte)
            const tallesVacios = producto.stock.filter((linea) => linea.cantidad === 0).length
            return (
              <div
                key={producto.id}
                className={producto.habilitado ? `${estilos.fila} ${propios.fila}` : `${estilos.fila} ${estilos.filaApagada} ${propios.fila}`}
              >
                <Link to={`/admin/productos/${producto.id}`} className={propios.producto}>
                  <span className={propios.miniatura}>
                    {producto.imagenUrl ? (
                      <img src={producto.imagenUrl} alt="" />
                    ) : (
                      <IlustracionProducto tipo={tipoIlustracion(producto.categoriaNombre)} className={propios.ilustracion} />
                    )}
                  </span>
                  <span className={propios.nombre}>
                    <strong className={propios.titulo}>{producto.nombre}</strong>
                    <span className={estilos.chico}>
                      {producto.marcaNombre} · {producto.categoriaNombre}
                    </span>
                    <span className={propios.marcas}>
                      {producto.destacado && <span className={`${estilos.sello} ${propios.destacado}`}>★ Destacado</span>}
                      {producto.precioOferta != null && <span className={`${estilos.sello} ${propios.oferta}`}>Oferta</span>}
                      {producto.personalizable && <span className={estilos.sello}>Personalizable</span>}
                      {!producto.habilitado && <span className={`${estilos.sello} ${propios.deshabilitado}`}>De baja</span>}
                    </span>
                  </span>
                </Link>
                <span className={estilos.sello} style={{ background: deporte?.color }}>
                  {deporte?.etiqueta}
                </span>
                <span className={estilos.dinero}>
                  {formatearPrecio(producto.precioOferta ?? producto.precio)}
                  {producto.precioOferta != null && (
                    <span className={estilos.chico}>
                      <s>{formatearPrecio(producto.precio)}</s>
                    </span>
                  )}
                </span>
                <span>
                  {producto.stockTotal === 0 ? (
                    <span className={`${estilos.sello} ${propios.sinStock}`}>Sin stock</span>
                  ) : (
                    <>
                      {producto.stockTotal} u.
                      {tallesVacios > 0 && <span className={estilos.chico}>{textoTalles(tallesVacios)}</span>}
                    </>
                  )}
                </span>
                <span className={propios.acciones}>
                  <Link to={`/admin/productos/${producto.id}`} className={estilos.botonFila}>
                    <Icono nombre="editar" tamanio={16} /> Editar
                  </Link>
                  <button
                    type="button"
                    className={`${estilos.botonFila} ${propios.basura}`}
                    onClick={() => setEliminando(producto)}
                    aria-label={`Eliminar ${producto.nombre}`}
                    title="Eliminar"
                  >
                    <Icono nombre="basura" tamanio={16} />
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}

      {datos && datos.totalElementos > 0 && (
        <Paginador
          pagina={pagina}
          totalPaginas={datos.totalPaginas}
          totalElementos={datos.totalElementos}
          sustantivo={['producto', 'productos']}
          tamanioPagina={TAMANIO_PAGINA}
          alCambiar={(siguiente) => cambiarParametros({ pagina: siguiente })}
        />
      )}
      {eliminando && (
        <DialogoEliminarProducto producto={eliminando} alCerrar={() => setEliminando(null)} alEliminar={alEliminar} alDarDeBaja={alDarDeBaja} />
      )}
    </div>
  )
}

export default AdminProductos
