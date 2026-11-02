import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { obtenerPedidosAdmin } from '../../api/admin'
import Avatar from '../../componentes/Avatar/Avatar'
import EtiquetaEstado from '../../componentes/EtiquetaEstado/EtiquetaEstado'
import Icono from '../../componentes/Icono/Icono'
import Paginador from '../../componentes/Paginador/Paginador'
import { formatearPrecio } from '../../utilidades/formato'
import estilos from './admin.module.css'

const TAMANIO_PAGINA = 20

// Filtros de la lista; la URL usa la clave (?estado=EN_PREPARACION). Sin estado se ven los que hay que preparar
const FILTROS = [
  { clave: 'todos', etiqueta: 'Todos', estado: null },
  { clave: 'PAGADO', etiqueta: 'Para preparar', estado: 'PAGADO' },
  { clave: 'EN_PREPARACION', etiqueta: 'En preparación', estado: 'EN_PREPARACION' },
  { clave: 'ENVIADO', etiqueta: 'Enviados', estado: 'ENVIADO' },
  { clave: 'ENTREGADO', etiqueta: 'Entregados', estado: 'ENTREGADO' },
  { clave: 'PENDIENTE_PAGO', etiqueta: 'Pendientes de pago', estado: 'PENDIENTE_PAGO' },
  { clave: 'CANCELADO', etiqueta: 'Cancelados', estado: 'CANCELADO' },
]

// Contadores de arriba (también se muestran en sus filtros)
const CONTADOS = ['PAGADO', 'EN_PREPARACION', 'ENVIADO', 'PENDIENTE_PAGO']

const COLUMNAS = '60px 90px minmax(0, 1.6fr) 60px 110px 140px 20px'

const fechaYHora = (iso) => {
  const fecha = new Date(iso)
  return {
    dia: fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    hora: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function AdminPedidos() {
  const [parametros, setParametros] = useSearchParams()
  const [recargas, setRecargas] = useState(0) // botón "Actualizar"
  const [lista, setLista] = useState({ clave: null, datos: null, error: '' })
  const [contadores, setContadores] = useState({})

  const filtro = FILTROS.find((f) => f.clave === parametros.get('estado')) ?? FILTROS[1]
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1)
  const clave = `${filtro.clave}-${pagina}-${recargas}`

  useEffect(() => {
    const controlador = new AbortController()
    const [claveFiltro, textoPagina] = clave.split('-')
    const estado = FILTROS.find((f) => f.clave === claveFiltro).estado
    obtenerPedidosAdmin({ estado, pagina: Number(textoPagina) - 1, tamanioPagina: TAMANIO_PAGINA }, controlador.signal)
      .then((datos) => setLista({ clave, datos, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setLista((anterior) => ({ clave, datos: anterior.datos, error: err.message }))
        }
      })
    return () => controlador.abort()
  }, [clave])

  // Solo hace falta el total de cada estado, por eso se pide de a un pedido
  useEffect(() => {
    const controlador = new AbortController()
    Promise.all(CONTADOS.map((estado) => obtenerPedidosAdmin({ estado, tamanioPagina: 1 }, controlador.signal)))
      .then((paginas) => setContadores(Object.fromEntries(CONTADOS.map((estado, i) => [estado, paginas[i].totalElementos]))))
      .catch(() => {}) // los contadores son informativos
    return () => controlador.abort()
  }, [recargas])

  const elegir = (claveFiltro) => setParametros(claveFiltro === 'PAGADO' ? {} : { estado: claveFiltro })
  const irAPagina = (siguiente) => {
    const nuevos = new URLSearchParams(parametros)
    nuevos.set('pagina', siguiente)
    setParametros(nuevos)
  }

  const cargando = lista.clave !== clave
  const datos = lista.datos
  const error = cargando ? '' : lista.error

  return (
    <div className={estilos.pantalla}>
      <p className={estilos.migas}>Panel / Pedidos</p>
      <div className={estilos.cabecera}>
        <h1 className={`display ${estilos.titulo}`}>Pedidos</h1>
        <button type="button" className={estilos.botonFantasma} onClick={() => setRecargas(recargas + 1)}>
          <Icono nombre="actualizar" tamanio={15} /> Actualizar
        </button>
      </div>

      <div className={estilos.datos}>
        {CONTADOS.map((estado) => {
          const info = FILTROS.find((f) => f.estado === estado)
          return (
            <button
              key={estado}
              type="button"
              className={estado === 'PAGADO' ? `${estilos.dato} ${estilos.datoDestacado}` : estilos.dato}
              onClick={() => elegir(info.clave)}
            >
              <span className={estilos.etiquetaDato}>{info.etiqueta}</span>
              <span className={`display ${estilos.valorDato}`}>{contadores[estado] ?? '–'}</span>
            </button>
          )
        })}
      </div>

      <div className={estilos.fichas} role="group" aria-label="Filtrar por estado">
        {FILTROS.map((opcion) => (
          <button
            key={opcion.clave}
            type="button"
            className={opcion.clave === filtro.clave ? `${estilos.ficha} ${estilos.fichaActiva}` : estilos.ficha}
            aria-pressed={opcion.clave === filtro.clave}
            onClick={() => elegir(opcion.clave)}
          >
            {opcion.etiqueta}
            {contadores[opcion.estado] > 0 && ` · ${contadores[opcion.estado]}`}
          </button>
        ))}
      </div>

      {error && (
        <p className="alerta-error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      {!datos && !error && <div className={estilos.esqueleto} aria-hidden="true" />}

      {datos?.contenido.length === 0 && (
        <div className={estilos.vacio}>
          <p className={`display ${estilos.tituloVacio}`}>No hay pedidos acá</p>
          <p className={estilos.tenue}>
            {filtro.estado === 'PAGADO' ? 'No quedan pedidos pagados por preparar.' : 'Probá con otro filtro.'}
          </p>
        </div>
      )}

      {datos?.contenido.length > 0 && (
        <div className={cargando ? `${estilos.tabla} ${estilos.cargando}` : estilos.tabla} style={{ '--columnas': COLUMNAS }}>
          <div className={estilos.cabeceraFila}>
            <span>N°</span>
            <span>Fecha</span>
            <span>Cliente</span>
            <span>Prod.</span>
            <span>Total</span>
            <span>Estado</span>
            <span />
          </div>
          {datos.contenido.map((pedido) => {
            const { dia, hora } = fechaYHora(pedido.fechaCreacion)
            const [nombre = '', ...resto] = pedido.clienteNombre.split(' ')
            return (
              <Link key={pedido.id} to={`/admin/pedidos/${pedido.id}`} className={estilos.fila}>
                <strong>#{pedido.id}</strong>
                <span>
                  {dia}
                  <span className={estilos.chico}>{hora}</span>
                </span>
                <span className={estilos.persona}>
                  <Avatar id={pedido.clienteId} nombre={nombre} apellido={resto.join(' ')} />
                  <span>
                    {pedido.clienteNombre}
                    <span className={estilos.chico}>{pedido.clienteEmail}</span>
                  </span>
                </span>
                <span>{pedido.cantidadItems} u.</span>
                <span className={estilos.dinero}>{formatearPrecio(pedido.total)}</span>
                <EtiquetaEstado estado={pedido.estado} />
                <span className={estilos.flechaFila}>
                  <Icono nombre="flechaDerecha" />
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {datos && datos.totalElementos > 0 && (
        <Paginador
          pagina={pagina}
          totalPaginas={datos.totalPaginas}
          totalElementos={datos.totalElementos}
          sustantivo={['pedido', 'pedidos']}
          tamanioPagina={TAMANIO_PAGINA}
          alCambiar={irAPagina}
        />
      )}
    </div>
  )
}

export default AdminPedidos
