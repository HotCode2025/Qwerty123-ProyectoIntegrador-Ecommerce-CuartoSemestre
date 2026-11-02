import { useEffect, useState } from 'react'
import { borrarItemCatalogo, guardarItemCatalogo, obtenerItemsCatalogo } from '../../api/admin'
import Icono from '../../componentes/Icono/Icono'
import { TIPOS_TALLE, tipoTallePorValor } from '../../utilidades/deportes'
import compartidos from './admin.module.css'
import estilos from './AdminCatalogo.module.css'

const textoProductos = (cantidad) => (cantidad === 1 ? '1 producto' : `${cantidad} productos`)
const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es')

/**
 * Lista editable de marcas o categorías (mismas rutas en el backend).
 * Las categorías además tienen tipo de talle. Lo que tiene productos no se puede borrar.
 */
function ListaCatalogo({ tipo, titulo, icono, singular, conTipoTalle }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null) // {id, nombre, tipoTalle}
  const [borrandoId, setBorrandoId] = useState(null) // fila esperando confirmación
  const [ocupado, setOcupado] = useState(false)
  const [borrador, setBorrador] = useState({ nombre: '', tipoTalle: 'ROPA' })

  useEffect(() => {
    const controlador = new AbortController()
    obtenerItemsCatalogo(tipo, controlador.signal)
      .then(setItems)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      })
    return () => controlador.abort()
  }, [tipo])

  const cuerpoDe = (valores) => (conTipoTalle ? { nombre: valores.nombre.trim(), tipoTalle: valores.tipoTalle } : { nombre: valores.nombre.trim() })

  // Ejecuta una acción contra el backend mostrando su error, si lo hay
  const ejecutar = (peticion, alTerminar) => {
    setOcupado(true)
    setError('')
    peticion
      .then(alTerminar)
      .catch((err) => setError(err.errores?.nombre ?? err.message))
      .finally(() => setOcupado(false))
  }

  const agregar = (evento) => {
    evento.preventDefault()
    ejecutar(guardarItemCatalogo(tipo, null, cuerpoDe(borrador)), (creado) => {
      setItems([...items, creado].sort(porNombre))
      setBorrador({ ...borrador, nombre: '' })
    })
  }

  const guardarEdicion = (evento) => {
    evento.preventDefault()
    ejecutar(guardarItemCatalogo(tipo, editando.id, cuerpoDe(editando)), (actualizado) => {
      setItems(items.map((item) => (item.id === actualizado.id ? actualizado : item)).sort(porNombre))
      setEditando(null)
    })
  }

  const borrar = (id) =>
    ejecutar(borrarItemCatalogo(tipo, id), () => {
      setItems(items.filter((item) => item.id !== id))
      setBorrandoId(null)
    })

  return (
    <section className={estilos.tarjeta} aria-labelledby={`titulo-${tipo}`}>
      <h2 id={`titulo-${tipo}`} className={`display ${estilos.titulo}`}>
        <Icono nombre={icono} /> {titulo}
        {items && <span className={compartidos.sello}>{items.length}</span>}
      </h2>

      {error && (
        <p className={estilos.advertencia} role="alert">
          <Icono nombre="alerta" /> {error}
        </p>
      )}

      {!items && !error && <div className={estilos.esqueleto} aria-hidden="true" />}

      <ul className={estilos.lista}>
        {items?.map((item) => {
          const tipoTalle = tipoTallePorValor(item.tipoTalle)

          if (editando?.id === item.id) {
            return (
              <li key={item.id} className={`${estilos.fila} ${estilos.filaEditando}`}>
                <form className={estilos.formularioEdicion} onSubmit={guardarEdicion}>
                  <label className="solo-lector" htmlFor={`editar-${tipo}`}>
                    Nombre
                  </label>
                  <input
                    id={`editar-${tipo}`}
                    className="entrada"
                    required
                    maxLength={60}
                    autoFocus
                    value={editando.nombre}
                    onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  />
                  {conTipoTalle && (
                    <select
                      className="entrada"
                      aria-label="Tipo de talle"
                      value={editando.tipoTalle}
                      onChange={(e) => setEditando({ ...editando, tipoTalle: e.target.value })}
                    >
                      {TIPOS_TALLE.map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.etiqueta}
                        </option>
                      ))}
                    </select>
                  )}
                  <button type="submit" className={`${compartidos.botonFila} ${compartidos.botonFilaAmarillo}`} disabled={ocupado} aria-label="Guardar">
                    <Icono nombre="tilde" tamanio={16} />
                  </button>
                  <button type="button" className={compartidos.botonFila} onClick={() => setEditando(null)} aria-label="Cancelar">
                    <Icono nombre="cerrar" tamanio={16} />
                  </button>
                </form>
              </li>
            )
          }

          if (borrandoId === item.id) {
            return (
              <li key={item.id} className={`${estilos.fila} ${estilos.filaPeligro}`}>
                <span>
                  ¿Borrar <strong>{item.nombre}</strong>?
                </span>
                <span className={estilos.accionesFila}>
                  <button type="button" className={`${compartidos.botonFila} ${compartidos.botonFilaAmarillo}`} onClick={() => borrar(item.id)} disabled={ocupado}>
                    {ocupado ? 'Borrando…' : 'Sí, borrar'}
                  </button>
                  <button type="button" className={compartidos.botonFila} onClick={() => setBorrandoId(null)}>
                    No
                  </button>
                </span>
              </li>
            )
          }

          return (
            <li key={item.id} className={estilos.fila}>
              <span className={estilos.nombre}>
                <strong>{item.nombre}</strong>
                <span className={compartidos.chico}>{item.cantidadProductos > 0 ? textoProductos(item.cantidadProductos) : 'Sin productos'}</span>
              </span>
              {conTipoTalle && (
                <span className={compartidos.sello} style={{ background: tipoTalle?.color }}>
                  {tipoTalle?.etiqueta} · {tipoTalle?.rango}
                </span>
              )}
              <span className={estilos.accionesFila}>
                <button
                  type="button"
                  className={compartidos.botonFila}
                  onClick={() => {
                    setEditando({ id: item.id, nombre: item.nombre, tipoTalle: item.tipoTalle })
                    setBorrandoId(null)
                    setError('')
                  }}
                  aria-label={`Editar ${item.nombre}`}
                >
                  <Icono nombre="editar" tamanio={16} />
                </button>
                <button
                  type="button"
                  className={compartidos.botonFila}
                  onClick={() => {
                    setBorrandoId(item.id)
                    setEditando(null)
                    setError('')
                  }}
                  disabled={item.cantidadProductos > 0}
                  title={item.cantidadProductos > 0 ? `No se puede borrar: tiene ${textoProductos(item.cantidadProductos)}` : undefined}
                  aria-label={`Borrar ${item.nombre}`}
                >
                  <Icono nombre="basura" tamanio={16} />
                </button>
              </span>
            </li>
          )
        })}
      </ul>

      {items && (
        <form className={estilos.formularioAlta} onSubmit={agregar}>
          <label className="solo-lector" htmlFor={`nueva-${tipo}`}>
            Nueva {singular}
          </label>
          <input
            id={`nueva-${tipo}`}
            className="entrada"
            required
            maxLength={60}
            placeholder={`Nueva ${singular}`}
            value={borrador.nombre}
            onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })}
          />
          {conTipoTalle && (
            <select className="entrada" aria-label="Tipo de talle" value={borrador.tipoTalle} onChange={(e) => setBorrador({ ...borrador, tipoTalle: e.target.value })}>
              {TIPOS_TALLE.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          )}
          <button type="submit" className="boton" disabled={ocupado}>
            <Icono nombre="mas" /> Agregar
          </button>
        </form>
      )}
    </section>
  )
}

function AdminCatalogo() {
  return (
    <div className={compartidos.pantalla}>
      <p className={compartidos.migas}>Panel / Marcas y categorías</p>
      <div className={compartidos.cabecera}>
        <h1 className={`display ${compartidos.titulo}`}>Marcas y categorías</h1>
      </div>
      <div className={estilos.columnas}>
        <ListaCatalogo tipo="marcas" titulo="Marcas" icono="premio" singular="marca" />
        <ListaCatalogo tipo="categorias" titulo="Categorías" icono="categoria" singular="categoría" conTipoTalle />
      </div>
      <p className={compartidos.tenue} style={{ marginTop: 16 }}>
        <Icono nombre="info" tamanio={14} /> Una marca o categoría con productos no se puede borrar: primero pasá sus productos a otra. El tipo de talle de una
        categoría solo se puede cambiar si no tiene productos.
      </p>
    </div>
  )
}

export default AdminCatalogo
