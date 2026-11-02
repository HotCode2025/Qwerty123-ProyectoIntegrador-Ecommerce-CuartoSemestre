import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { cambiarHabilitadoUsuario, obtenerUsuariosAdmin } from '../../api/admin'
import Avatar from '../../componentes/Avatar/Avatar'
import Icono from '../../componentes/Icono/Icono'
import Paginador from '../../componentes/Paginador/Paginador'
import estilos from './admin.module.css'

const TAMANIO_PAGINA = 20
const COLUMNAS = 'minmax(0, 1.4fr) minmax(0, 1.4fr) 90px 90px 120px 140px'

const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

function AdminUsuarios() {
  const [parametros, setParametros] = useSearchParams()
  const [lista, setLista] = useState({ clave: null, datos: null, error: '' })
  const [guardandoId, setGuardandoId] = useState(null)
  const [errorAccion, setErrorAccion] = useState('')

  const busqueda = parametros.get('q') ?? ''
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1)
  const clave = JSON.stringify({ busqueda, pagina })

  useEffect(() => {
    const controlador = new AbortController()
    const consulta = JSON.parse(clave)
    obtenerUsuariosAdmin({ busqueda: consulta.busqueda, pagina: consulta.pagina - 1, tamanioPagina: TAMANIO_PAGINA }, controlador.signal)
      .then((datos) => setLista({ clave, datos, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setLista((anterior) => ({ clave, datos: anterior.datos, error: err.message }))
        }
      })
    return () => controlador.abort()
  }, [clave])

  const alBuscar = (evento) => {
    evento.preventDefault()
    const texto = new FormData(evento.currentTarget).get('q').trim()
    setParametros(texto ? { q: texto } : {})
  }

  const irAPagina = (siguiente) => {
    const nuevos = new URLSearchParams(parametros)
    nuevos.set('pagina', siguiente)
    setParametros(nuevos)
  }

  // Cambia el estado y reemplaza esa fila con lo que devuelve el backend
  const alternar = (usuario) => {
    setGuardandoId(usuario.id)
    setErrorAccion('')
    cambiarHabilitadoUsuario(usuario.id, !usuario.habilitado)
      .then((actualizado) =>
        setLista((anterior) => ({
          ...anterior,
          datos: { ...anterior.datos, contenido: anterior.datos.contenido.map((u) => (u.id === actualizado.id ? actualizado : u)) },
        })),
      )
      .catch((err) => setErrorAccion(err.message))
      .finally(() => setGuardandoId(null))
  }

  const cargando = lista.clave !== clave
  const datos = lista.datos
  const error = cargando ? '' : lista.error

  return (
    <div className={estilos.pantalla}>
      <p className={estilos.migas}>Panel / Usuarios</p>
      <div className={estilos.cabecera}>
        <h1 className={`display ${estilos.titulo}`}>Usuarios</h1>
        <form className={estilos.busqueda} onSubmit={alBuscar} role="search">
          <label className="solo-lector" htmlFor="busqueda-usuarios">
            Buscar usuarios
          </label>
          <Icono nombre="buscar" className={estilos.iconoBusqueda} />
          <input key={busqueda} id="busqueda-usuarios" name="q" className="entrada" type="search" defaultValue={busqueda} maxLength={60} placeholder="Buscar por nombre o email" />
        </form>
      </div>

      {(error || errorAccion) && (
        <p className="alerta-error" role="alert" style={{ marginBottom: 16 }}>
          {error || errorAccion}
        </p>
      )}

      {!datos && !error && <div className={estilos.esqueleto} aria-hidden="true" />}

      {datos?.contenido.length === 0 && (
        <div className={estilos.vacio}>
          <p className={`display ${estilos.tituloVacio}`}>Sin resultados</p>
          <p className={estilos.tenue}>No hay usuarios que coincidan con "{busqueda}".</p>
        </div>
      )}

      {datos?.contenido.length > 0 && (
        <div className={cargando ? `${estilos.tabla} ${estilos.cargando}` : estilos.tabla} style={{ '--columnas': COLUMNAS }}>
          <div className={estilos.cabeceraFila}>
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Alta</span>
            <span>Estado</span>
            <span />
          </div>
          {datos.contenido.map((usuario) => {
            const esAdmin = usuario.rol === 'ADMIN'
            return (
              <div key={usuario.id} className={usuario.habilitado ? estilos.fila : `${estilos.fila} ${estilos.filaApagada}`}>
                <span className={estilos.persona}>
                  <Avatar id={usuario.id} nombre={usuario.nombre} apellido={usuario.apellido} apagado={!usuario.habilitado} />
                  <span>
                    <strong>
                      {usuario.nombre} {usuario.apellido}
                    </strong>
                    {usuario.telefono && <span className={estilos.chico}>{usuario.telefono}</span>}
                  </span>
                </span>
                <span style={{ overflowWrap: 'anywhere' }}>{usuario.email}</span>
                <span className={estilos.sello} style={esAdmin ? { background: 'var(--tinta)', color: 'var(--amarillo)' } : undefined}>
                  {esAdmin ? 'Admin' : 'Cliente'}
                </span>
                <span>{fechaCorta(usuario.fechaCreacion)}</span>
                <span className={estilos.sello} style={{ background: usuario.habilitado ? 'var(--verde)' : 'var(--error)' }}>
                  {usuario.habilitado ? 'Activo' : 'Deshabilitado'}
                </span>
                {esAdmin ? (
                  <span className={estilos.chico}>No editable</span>
                ) : (
                  <button
                    type="button"
                    className={usuario.habilitado ? estilos.botonFila : `${estilos.botonFila} ${estilos.botonFilaAmarillo}`}
                    onClick={() => alternar(usuario)}
                    disabled={guardandoId === usuario.id}
                  >
                    <Icono nombre={usuario.habilitado ? 'prohibido' : 'tilde'} tamanio={16} />
                    {guardandoId === usuario.id ? 'Guardando…' : usuario.habilitado ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                )}
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
          sustantivo={['usuario', 'usuarios']}
          tamanioPagina={TAMANIO_PAGINA}
          alCambiar={irAPagina}
        />
      )}
      <p className={estilos.tenue} style={{ marginTop: 12 }}>
        <Icono nombre="info" tamanio={14} /> Un usuario deshabilitado no puede ingresar ni comprar.
      </p>
    </div>
  )
}

export default AdminUsuarios
