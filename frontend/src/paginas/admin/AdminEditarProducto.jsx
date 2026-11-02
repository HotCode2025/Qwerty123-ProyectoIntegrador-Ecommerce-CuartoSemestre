import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { actualizarStock, guardarProducto, obtenerProductoAdmin, subirImagenProducto } from '../../api/admin'
import { obtenerFiltrosCatalogo } from '../../api/productos'
import Icono from '../../componentes/Icono/Icono'
import { DEPORTES, talleCorrespondeAlDeporte, tipoTallePorValor } from '../../utilidades/deportes'
import { porcentajeDescuento } from '../../utilidades/tienda'
import compartidos from './admin.module.css'
import estilos from './AdminEditarProducto.module.css'
import DialogoEliminarProducto from './DialogoEliminarProducto'

const MAXIMO_BYTES_FOTO = 3 * 1024 * 1024 // mismo límite que el backend
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
const MAXIMO_DESCRIPCION = 1000

const FORMULARIO_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  enOferta: false,
  precioOferta: '',
  deporte: 'FUTBOL',
  categoriaId: '',
  marcaId: '',
  personalizable: false,
  destacado: false,
  habilitado: true,
}

const formularioDe = (producto) => ({
  nombre: producto.nombre,
  descripcion: producto.descripcion ?? '',
  precio: String(Number(producto.precio)),
  enOferta: producto.precioOferta != null,
  precioOferta: producto.precioOferta != null ? String(Number(producto.precioOferta)) : '',
  deporte: producto.deporte,
  categoriaId: String(producto.categoriaId),
  marcaId: String(producto.marcaId),
  personalizable: producto.personalizable,
  destacado: producto.destacado,
  habilitado: producto.habilitado,
})

const stockDe = (producto) => Object.fromEntries(producto.stock.map((linea) => [linea.talleId, String(linea.cantidad)]))

// El porcentaje se muestra solo cuando la oferta es menor que el precio normal
const porcentajeVisible = ({ precio, precioOferta }) =>
  precio !== '' && precioOferta !== '' && Number(precioOferta) > 0 && Number(precioOferta) < Number(precio)

const textoPersonas = (cantidad) => (cantidad === 1 ? '1 persona espera' : `${cantidad} personas esperan`)

/** Foto del producto: se elige con el botón o se arrastra encima. */
function CajaFoto({ producto, alSubir }) {
  const referenciaEntrada = useRef(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const subir = (archivo) => {
    if (!archivo) {
      return
    }
    if (!TIPOS_FOTO.includes(archivo.type)) {
      setError('La foto tiene que ser JPG, PNG o WEBP.')
      return
    }
    if (archivo.size > MAXIMO_BYTES_FOTO) {
      setError('La foto puede pesar hasta 3 MB.')
      return
    }
    setSubiendo(true)
    setError('')
    subirImagenProducto(producto.id, archivo)
      .then(alSubir)
      .catch((err) => setError(err.message))
      .finally(() => setSubiendo(false))
  }

  return (
    <section className={estilos.caja}>
      <h2 className={`display ${estilos.tituloCaja}`}>
        <Icono nombre="foto" /> Foto
      </h2>
      <button
        type="button"
        className={arrastrando ? `${estilos.soltar} ${estilos.soltarActivo}` : estilos.soltar}
        onClick={() => referenciaEntrada.current.click()}
        onDragOver={(evento) => {
          evento.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(evento) => {
          evento.preventDefault()
          setArrastrando(false)
          subir(evento.dataTransfer.files[0])
        }}
        disabled={subiendo}
        aria-label={producto.imagenUrl ? 'Cambiar la foto' : 'Subir una foto'}
      >
        {producto.imagenUrl && <img src={producto.imagenUrl} alt="" className={estilos.foto} />}
        <span className={producto.imagenUrl ? `${estilos.textoSoltar} ${estilos.soltarEncima}` : estilos.textoSoltar}>
          <Icono nombre="subir" tamanio={24} />
          {subiendo ? 'Subiendo…' : producto.imagenUrl ? 'Cambiar foto' : 'Arrastrá una imagen o tocá para elegirla'}
        </span>
      </button>
      <input
        ref={referenciaEntrada}
        type="file"
        accept={TIPOS_FOTO.join(',')}
        hidden
        onChange={(evento) => {
          subir(evento.target.files[0])
          evento.target.value = '' // permite volver a elegir el mismo archivo
        }}
      />
      <p className={compartidos.chico}>JPG, PNG o WEBP hasta 3 MB.</p>
      {error && (
        <p className="error-campo" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

/** Stock por talle del tipo de talle de la categoría guardada. */
function CajaStock({ producto, talles, cambioCategoria, alGuardar }) {
  const [cantidades, setCantidades] = useState(() => stockDe(producto))
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState({ listo: '', error: '' })

  const pendientesPorTalle = Object.fromEntries(producto.stock.map((linea) => [linea.talleId, linea.avisosPendientes]))
  const total = talles.reduce((suma, talle) => suma + (Number(cantidades[talle.id]) || 0), 0)
  const esperando = talles.filter((talle) => pendientesPorTalle[talle.id] > 0)

  const guardar = (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setMensaje({ listo: '', error: '' })
    actualizarStock(
      producto.id,
      talles.map((talle) => ({ talleId: talle.id, cantidad: Number(cantidades[talle.id]) || 0 })),
    )
      .then((actualizado) => {
        alGuardar(actualizado)
        setCantidades(stockDe(actualizado))
        setMensaje({ listo: 'Stock guardado', error: '' })
      })
      .catch((err) => setMensaje({ listo: '', error: err.message }))
      .finally(() => setGuardando(false))
  }

  return (
    <form className={estilos.caja} onSubmit={guardar}>
      <h2 className={`display ${estilos.tituloCaja}`}>
        <Icono nombre="pila" /> Stock por talle
      </h2>
      {cambioCategoria ? (
        <p className={estilos.nota}>Guardá los datos primero: con la categoría o el deporte nuevos cambian los talles.</p>
      ) : (
        <>
          <div className={estilos.talles}>
            {talles.map((talle) => (
              <label key={talle.id} className={estilos.talle}>
                <span>{talle.etiqueta}</span>
                <input
                  className={Number(cantidades[talle.id]) > 0 ? 'entrada' : `entrada ${estilos.cero}`}
                  type="number"
                  min="0"
                  max="9999"
                  inputMode="numeric"
                  value={cantidades[talle.id] ?? '0'}
                  onChange={(evento) => {
                    setCantidades({ ...cantidades, [talle.id]: evento.target.value.replace(/\D/g, '').slice(0, 4) })
                    setMensaje({ listo: '', error: '' })
                  }}
                />
              </label>
            ))}
          </div>
          <p className={estilos.total}>Total: {total} u.</p>
          {esperando.map((talle) => (
            <p key={talle.id} className={estilos.esperando}>
              <Icono nombre="campana" tamanio={16} /> {textoPersonas(pendientesPorTalle[talle.id])} el talle {talle.etiqueta}: les llega un mail cuando cargues stock.
            </p>
          ))}
          <button type="submit" className={`boton boton-negro ${estilos.completo}`} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar stock'}
          </button>
          {mensaje.listo && (
            <p className={estilos.listo} role="status">
              <Icono nombre="tilde" tamanio={16} /> {mensaje.listo}
            </p>
          )}
          {mensaje.error && (
            <p className="error-campo" role="alert">
              {mensaje.error}
            </p>
          )}
        </>
      )}
    </form>
  )
}

function AdminEditarProducto({ id }) {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const esNuevo = id === 'nuevo'
  const [datos, setDatos] = useState({ producto: null, filtros: null, error: null })
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)
  // Mensaje verde junto al botón; al crear un producto se llega acá con state.creado
  const [textoGuardado, setTextoGuardado] = useState(ubicacion.state?.creado ? 'Producto creado. Ahora cargá la foto y el stock.' : '')
  const [error, setError] = useState('')
  const [erroresCampos, setErroresCampos] = useState({})
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()
    Promise.all([obtenerFiltrosCatalogo(controlador.signal), esNuevo ? null : obtenerProductoAdmin(id, controlador.signal)])
      .then(([filtros, producto]) => {
        setDatos({ producto, filtros, error: null })
        if (producto) {
          setFormulario(formularioDe(producto))
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setDatos({ producto: null, filtros: null, error: err })
        }
      })
    return () => controlador.abort()
  }, [id, esNuevo])

  const { producto, filtros } = datos

  if (datos.error) {
    return (
      <div className={compartidos.vacio}>
        <p className={`display ${compartidos.tituloVacio}`}>{datos.error.estado === 404 ? 'Producto no encontrado' : 'No se pudo cargar el producto'}</p>
        <p className={compartidos.tenue}>{datos.error.message}</p>
        <Link to="/admin/productos" className="boton" style={{ marginTop: 16 }}>
          Volver a productos
        </Link>
      </div>
    )
  }

  if (!filtros) {
    return <div className={compartidos.esqueleto} aria-busy="true" />
  }

  const categoria = filtros.categorias.find((c) => String(c.id) === formulario.categoriaId)
  // Mismas reglas que el backend: solo camisetas (talle de ropa) de fútbol o básquet
  const puedePersonalizar = categoria?.tipoTalle === 'ROPA' && formulario.deporte !== 'PADEL'
  // Los talles de stock dependen de la categoría guardada (y del deporte, en las pelotas)
  const cambioCategoria =
    producto !== null &&
    (categoria?.tipoTalle !== producto.tipoTalle || (producto.tipoTalle === 'PELOTA' && formulario.deporte !== producto.deporte))

  const cambiar = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor })
    setTextoGuardado('')
    setErroresCampos({ ...erroresCampos, [campo]: undefined })
  }

  const alEnviar = (evento) => {
    evento.preventDefault()
    if (formulario.enOferta && formulario.precioOferta === '') {
      setErroresCampos({ precioOferta: 'Escribí el precio de oferta o destildá "En oferta"' })
      return
    }
    setGuardando(true)
    setError('')
    setErroresCampos({})
    const { enOferta, ...datos } = formulario
    const cuerpo = {
      ...datos,
      precio: formulario.precio === '' ? null : Number(formulario.precio),
      precioOferta: enOferta ? Number(formulario.precioOferta) : null, // null = sin oferta
      categoriaId: formulario.categoriaId ? Number(formulario.categoriaId) : null,
      marcaId: formulario.marcaId ? Number(formulario.marcaId) : null,
      personalizable: puedePersonalizar && formulario.personalizable,
    }
    guardarProducto(producto?.id, cuerpo)
      .then((resultado) => {
        if (esNuevo) {
          // Recién creado: se pasa a su pantalla de edición para cargar foto y stock
          navegar(`/admin/productos/${resultado.id}`, { replace: true, state: { creado: true } })
          return
        }
        setDatos({ ...datos, producto: resultado })
        setFormulario(formularioDe(resultado))
        setTextoGuardado('Cambios guardados')
        setGuardando(false)
      })
      .catch((err) => {
        setError(err.message)
        setErroresCampos(err.errores ?? {})
        setGuardando(false)
      })
  }

  const errorDe = (nombre) =>
    erroresCampos[nombre] && (
      <p id={`${nombre}-error`} className="error-campo">
        {erroresCampos[nombre]}
      </p>
    )
  const invalido = (nombre) => ({
    'aria-invalid': erroresCampos[nombre] ? true : undefined,
    'aria-describedby': erroresCampos[nombre] ? `${nombre}-error` : undefined,
  })

  const deporteGuardado = filtros.deportes.find((d) => d.valor === producto?.deporte)
  const talles = producto
    ? filtros.talles.filter((talle) => talle.tipoTalle === producto.tipoTalle && talleCorrespondeAlDeporte(talle, deporteGuardado))
    : []

  return (
    <div className={compartidos.pantalla}>
      <p className={compartidos.migas}>
        <Link to="/admin">Panel</Link> / <Link to="/admin/productos">Productos</Link> / {producto ? producto.nombre : 'Nuevo'}
      </p>
      <div className={compartidos.cabecera}>
        <h1 className={`display ${compartidos.titulo}`}>{producto ? 'Editar producto' : 'Nuevo producto'}</h1>
        {producto && (
          <span className={estilos.sellosCabecera}>
            <span className={compartidos.sello} style={{ background: producto.habilitado ? 'var(--verde)' : 'var(--error)' }}>
              {producto.habilitado ? 'Visible en la tienda' : 'De baja'}
            </span>
            <span className={compartidos.sello}>Alta: {new Date(producto.fechaCreacion).toLocaleDateString('es-AR')}</span>
            {producto.habilitado && (
              <Link to={`/producto/${producto.id}`} className={compartidos.botonFantasma}>
                Ver en la tienda
              </Link>
            )}
          </span>
        )}
      </div>

      <div className={estilos.disposicion}>
        <form className={estilos.caja} onSubmit={alEnviar}>
          <h2 className={`display ${estilos.tituloCaja}`}>
            <Icono nombre="editar" /> Datos del producto
          </h2>
          <div className={estilos.grilla}>
            <div className={`campo ${estilos.ancho}`}>
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" className="entrada" required maxLength={120} value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} {...invalido('nombre')} />
              {errorDe('nombre')}
            </div>
            <div className={`campo ${estilos.ancho}`}>
              <label htmlFor="descripcion">
                Descripción <span className={estilos.pista}>(opcional · {formulario.descripcion.length}/{MAXIMO_DESCRIPCION})</span>
              </label>
              <textarea
                id="descripcion"
                className={`entrada ${estilos.areaTexto}`}
                rows={3}
                maxLength={MAXIMO_DESCRIPCION}
                value={formulario.descripcion}
                onChange={(e) => cambiar('descripcion', e.target.value)}
                {...invalido('descripcion')}
              />
              {errorDe('descripcion')}
            </div>
            <div className="campo">
              <label htmlFor="precio">Precio</label>
              <span className={estilos.dinero}>
                <span aria-hidden="true">$</span>
                <input id="precio" className="entrada" type="number" required min="1" step="1" value={formulario.precio} onChange={(e) => cambiar('precio', e.target.value)} {...invalido('precio')} />
              </span>
              {errorDe('precio')}
            </div>
            <div className="campo">
              <label htmlFor="deporte">Deporte</label>
              <select id="deporte" className="entrada" value={formulario.deporte} onChange={(e) => cambiar('deporte', e.target.value)}>
                {DEPORTES.map((deporte) => (
                  <option key={deporte.valor} value={deporte.valor}>
                    {deporte.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="categoriaId">Categoría</label>
              <select id="categoriaId" className="entrada" required value={formulario.categoriaId} onChange={(e) => cambiar('categoriaId', e.target.value)} {...invalido('categoriaId')}>
                <option value="" disabled>
                  Elegí una categoría
                </option>
                {filtros.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (talles {tipoTallePorValor(c.tipoTalle)?.rango})
                  </option>
                ))}
              </select>
              {errorDe('categoriaId')}
            </div>
            <div className="campo">
              <label htmlFor="marcaId">Marca</label>
              <select id="marcaId" className="entrada" required value={formulario.marcaId} onChange={(e) => cambiar('marcaId', e.target.value)} {...invalido('marcaId')}>
                <option value="" disabled>
                  Elegí una marca
                </option>
                {filtros.marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              {errorDe('marcaId')}
            </div>
          </div>

          <div className={estilos.opciones}>
            <label className={puedePersonalizar ? estilos.opcion : `${estilos.opcion} ${estilos.opcionApagada}`}>
              <input
                type="checkbox"
                checked={puedePersonalizar && formulario.personalizable}
                disabled={!puedePersonalizar}
                onChange={(e) => cambiar('personalizable', e.target.checked)}
              />
              <span>
                <strong>Personalizable</strong>
                <span className={estilos.pista}>{puedePersonalizar ? 'Nombre y número en la espalda' : 'Solo camisetas de fútbol o básquet'}</span>
              </span>
            </label>
            <label className={estilos.opcion}>
              <input type="checkbox" checked={formulario.destacado} onChange={(e) => cambiar('destacado', e.target.checked)} />
              <span>
                <strong>Destacado</strong>
                <span className={estilos.pista}>Aparece en "Lo más buscado" del inicio</span>
              </span>
            </label>
            <label className={estilos.opcion}>
              <input type="checkbox" checked={formulario.habilitado} onChange={(e) => cambiar('habilitado', e.target.checked)} />
              <span>
                <strong>Visible en la tienda</strong>
                <span className={estilos.pista}>Destildalo para darlo de baja</span>
              </span>
            </label>
            <label className={estilos.opcion}>
              <input type="checkbox" checked={formulario.enOferta} onChange={(e) => cambiar('enOferta', e.target.checked)} />
              <span>
                <strong>En oferta</strong>
                <span className={estilos.pista}>Muestra el precio normal tachado</span>
              </span>
            </label>
          </div>

          {formulario.enOferta && (
            <div className={`campo ${estilos.campoOferta}`}>
              <label htmlFor="precioOferta">
                Precio de oferta{' '}
                {porcentajeVisible(formulario) && (
                  <span className={estilos.pista}>({porcentajeDescuento(formulario.precio, formulario.precioOferta)}% de descuento)</span>
                )}
              </label>
              <span className={estilos.dinero}>
                <span aria-hidden="true">$</span>
                <input
                  id="precioOferta"
                  className="entrada"
                  type="number"
                  min="1"
                  step="1"
                  value={formulario.precioOferta}
                  onChange={(e) => cambiar('precioOferta', e.target.value)}
                  {...invalido('precioOferta')}
                />
              </span>
              {errorDe('precioOferta')}
            </div>
          )}

          {error && Object.keys(erroresCampos).length === 0 && (
            <p className="alerta-error" role="alert">
              {error}
            </p>
          )}

          <div className={estilos.acciones}>
            <button type="submit" className="boton" disabled={guardando}>
              <Icono nombre="guardar" /> {guardando ? 'Guardando…' : producto ? 'Guardar cambios' : 'Crear producto'}
            </button>
            {textoGuardado && (
              <span className={estilos.listo} role="status">
                <Icono nombre="tilde" tamanio={16} /> {textoGuardado}
              </span>
            )}
            {producto && (
              <button type="button" className={`boton boton-blanco ${estilos.eliminar}`} onClick={() => setEliminando(true)}>
                <Icono nombre="basura" /> Eliminar
              </button>
            )}
          </div>
        </form>

        <div className={estilos.lateral}>
          {producto ? (
            <>
              <CajaFoto producto={producto} alSubir={(actualizado) => setDatos({ ...datos, producto: actualizado })} />
              <CajaStock
                key={`${producto.tipoTalle}-${producto.deporte}`} // si se guardó otra categoría o deporte, los talles cambian
                producto={producto}
                talles={talles}
                cambioCategoria={cambioCategoria}
                alGuardar={(actualizado) => setDatos({ ...datos, producto: actualizado })}
              />
            </>
          ) : (
            <section className={`${estilos.caja} ${estilos.bloqueado}`}>
              <Icono nombre="info" tamanio={22} />
              <p>La foto y el stock se cargan después de crear el producto.</p>
            </section>
          )}
        </div>
      </div>

      {eliminando && (
        <DialogoEliminarProducto
          producto={producto}
          alCerrar={() => setEliminando(false)}
          alEliminar={(eliminado) => navegar('/admin/productos', { replace: true, state: { eliminado: eliminado.nombre } })}
          alDarDeBaja={(actualizado) => {
            setDatos({ ...datos, producto: actualizado })
            setFormulario(formularioDe(actualizado))
            setTextoGuardado('Producto dado de baja')
            setEliminando(false)
          }}
        />
      )}
    </div>
  )
}

// La key hace que al pasar de "nuevo" al producto creado el formulario arranque de cero
function PaginaAdminProducto() {
  const { id } = useParams()
  return <AdminEditarProducto key={id} id={id} />
}

export default PaginaAdminProducto
