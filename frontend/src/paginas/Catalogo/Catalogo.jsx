import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { obtenerFiltrosCatalogo, obtenerProductos } from '../../api/productos'
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto'
import { formatearPrecio } from '../../utilidades/formato'
import { DEPORTES, deportePorSlug, talleCorrespondeAlDeporte } from '../../utilidades/deportes'
import estilos from './Catalogo.module.css'

const TAMANIO_PAGINA = 12
const PASO_PRECIO = 5000

const ORDENES = [
  { valor: 'recientes', etiqueta: 'Más nuevos' },
  { valor: 'precio_asc', etiqueta: 'Menor precio' },
  { valor: 'precio_desc', etiqueta: 'Mayor precio' },
  { valor: 'nombre', etiqueta: 'Nombre (A-Z)' },
]

// Talles agrupados por tipo; "Único" no se muestra porque no filtra nada
const GRUPOS_TALLE = [
  { tipo: 'ROPA', etiqueta: 'Ropa' },
  { tipo: 'CALZADO', etiqueta: 'Calzado' },
  { tipo: 'PELOTA', etiqueta: 'Pelotas' },
]

// Parámetros de la URL que cuentan como filtros (para el contador y "Limpiar filtros")
const CLAVES_FILTRO = ['deporte', 'oferta', 'categoria', 'marca', 'talle', 'precio', 'q']

const textoProductos = (cantidad) => (cantidad === 1 ? '1 producto' : `${cantidad} productos`)

function Ficha({ activa, onClick, children }) {
  return (
    <button type="button" className={activa ? `${estilos.ficha} ${estilos.fichaActiva}` : estilos.ficha} onClick={onClick} aria-pressed={activa}>
      {children}
    </button>
  )
}

function Catalogo() {
  const [parametros, setParametros] = useSearchParams()
  const [filtros, setFiltros] = useState(null)
  const [respuesta, setRespuesta] = useState({ clave: null, datos: null, error: '' }) // última respuesta y de qué consulta es
  const [precioBorrador, setPrecioBorrador] = useState(null) // valor del slider mientras se arrastra
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false) // panel de filtros en celular

  // Los filtros se leen de la URL: /catalogo?deporte=futbol&talle=3&pagina=2
  const deporte = deportePorSlug(parametros.get('deporte'))
  const categoriaId = Number(parametros.get('categoria')) || null
  const marcaId = Number(parametros.get('marca')) || null
  const talleId = Number(parametros.get('talle')) || null
  const precioMaximo = Number(parametros.get('precio')) || null
  const soloOfertas = parametros.get('oferta') === '1'
  const busqueda = parametros.get('q') ?? ''
  const orden = parametros.get('orden') ?? 'recientes'
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1)
  const filtrosActivos = CLAVES_FILTRO.filter((clave) => parametros.has(clave)).length

  /** Cambia un parámetro de la URL; cualquier filtro nuevo vuelve a la página 1. */
  const cambiarParametro = (clave, valor) => {
    const siguientes = new URLSearchParams(parametros)
    if (valor === null || valor === undefined || valor === '') {
      siguientes.delete(clave)
    } else {
      siguientes.set(clave, valor)
    }
    if (clave !== 'pagina') {
      siguientes.delete('pagina')
    }
    // Al filtrar se queda en el lugar; al cambiar de página vuelve arriba
    setParametros(siguientes, { preventScrollReset: clave !== 'pagina' })
  }

  const alternarParametro = (clave, valor) => cambiarParametro(clave, parametros.get(clave) === String(valor) ? null : valor)

  // Al cambiar de categoría se borra el talle: puede ser de otro tipo (ropa vs. calzado)
  const elegirCategoria = (id) => {
    const siguientes = new URLSearchParams(parametros)
    siguientes.delete('talle')
    siguientes.delete('pagina')
    if (id === categoriaId) {
      siguientes.delete('categoria')
    } else {
      siguientes.set('categoria', id)
    }
    setParametros(siguientes, { preventScrollReset: true })
  }

  const limpiarFiltros = () => {
    const siguientes = new URLSearchParams()
    if (parametros.has('orden')) {
      siguientes.set('orden', orden)
    }
    setParametros(siguientes, { preventScrollReset: true })
  }

  useEffect(() => {
    const controlador = new AbortController()
    obtenerFiltrosCatalogo(controlador.signal)
      .then(setFiltros)
      .catch(() => {}) // sin filtros igual se puede ver el catálogo
    return () => controlador.abort()
  }, [])

  // La consulta como texto: si cambia, se vuelve a pedir la lista
  const claveConsulta = JSON.stringify({
    deporte: deporte?.valor,
    categoriaId,
    marcaId,
    talleId,
    precioMaximo,
    enOferta: soloOfertas || undefined, // sin el parámetro, todos los productos
    busqueda,
    orden,
    pagina: pagina - 1, // el backend cuenta desde 0
    tamanioPagina: TAMANIO_PAGINA,
  })

  useEffect(() => {
    const controlador = new AbortController()
    obtenerProductos(JSON.parse(claveConsulta), controlador.signal)
      .then((datos) => setRespuesta({ clave: claveConsulta, datos, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          // Se mantiene la lista anterior en pantalla junto al mensaje de error
          setRespuesta((anterior) => ({ clave: claveConsulta, datos: anterior.datos, error: err.message }))
        }
      })
    return () => controlador.abort()
  }, [claveConsulta])

  // Mientras la respuesta guardada no sea de la consulta actual, se está cargando
  const cargando = respuesta.clave !== claveConsulta
  const resultado = respuesta.datos
  const error = cargando ? '' : respuesta.error

  // El precio se aplica al soltar el slider (o la tecla), no en cada paso del arrastre
  const confirmarPrecio = () => {
    if (precioBorrador === null) {
      return
    }
    cambiarParametro('precio', precioBorrador >= precioTope(filtros) ? null : precioBorrador)
    setPrecioBorrador(null)
  }

  const alBuscar = (evento) => {
    evento.preventDefault()
    cambiarParametro('q', new FormData(evento.currentTarget).get('q').trim())
  }

  const categoriaElegida = filtros?.categorias.find((categoria) => categoria.id === categoriaId)
  // Con un deporte elegido, las pelotas muestran solo sus talles (fútbol N° 3 a 5, básquet N° 6 y 7)
  const opcionDeporte = filtros?.deportes.find((d) => d.valor === deporte?.valor)
  const gruposTalle = GRUPOS_TALLE.filter((grupo) => !categoriaElegida || categoriaElegida.tipoTalle === grupo.tipo)
    .map((grupo) => ({
      ...grupo,
      talles: filtros?.talles.filter((talle) => talle.tipoTalle === grupo.tipo && talleCorrespondeAlDeporte(talle, opcionDeporte)) ?? [],
    }))
    .filter((grupo) => grupo.talles.length > 0)

  const titulo = deporte ? deporte.etiqueta : 'Catálogo'
  const productos = resultado?.contenido ?? []
  const totalPaginas = resultado?.totalPaginas ?? 0

  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <div className={estilos.cabecera}>
        <p className={estilos.migas}>
          <Link to="/">Inicio</Link> / Catálogo{deporte && ` / ${deporte.etiqueta}`}
        </p>
        <h1 className={`display ${estilos.titulo}`}>{titulo}</h1>
        <p className="chico">{resultado ? textoProductos(resultado.totalElementos) : 'Buscando productos…'}</p>
      </div>

      <div className={estilos.disposicion}>
        <button
          type="button"
          className={`boton boton-blanco ${estilos.alternarFiltros}`}
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          aria-expanded={filtrosAbiertos}
          aria-controls="filtros-catalogo"
        >
          {filtrosAbiertos ? 'Ocultar filtros' : 'Filtros'}
          {filtrosActivos > 0 && <span className={estilos.cantidad}>{filtrosActivos}</span>}
        </button>

        <aside id="filtros-catalogo" className={filtrosAbiertos ? `${estilos.filtros} ${estilos.filtrosAbiertos}` : estilos.filtros} aria-label="Filtros">
          <form onSubmit={alBuscar} role="search">
            <label className={estilos.tituloGrupo} htmlFor="busqueda-catalogo">
              Buscar
            </label>
            <div className={estilos.filaBusqueda}>
              <input key={busqueda} id="busqueda-catalogo" name="q" className={estilos.entrada} type="search" defaultValue={busqueda} maxLength={60} placeholder="Ej.: camiseta" />
              <button type="submit" className={estilos.botonBuscar} aria-label="Buscar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-4-4" />
                </svg>
              </button>
            </div>
          </form>

          <fieldset className={estilos.grupo}>
            <legend className={estilos.tituloGrupo}>Deporte</legend>
            <div className={estilos.fichas}>
              <Ficha activa={!deporte} onClick={() => cambiarParametro('deporte', null)}>
                Todos
              </Ficha>
              {DEPORTES.map((opcion) => (
                <Ficha key={opcion.valor} activa={deporte?.valor === opcion.valor} onClick={() => cambiarParametro('deporte', opcion.slug)}>
                  {opcion.etiqueta}
                </Ficha>
              ))}
            </div>
          </fieldset>

          <fieldset className={estilos.grupo}>
            <legend className={estilos.tituloGrupo}>Ofertas</legend>
            <div className={estilos.fichas}>
              <Ficha activa={soloOfertas} onClick={() => cambiarParametro('oferta', soloOfertas ? null : '1')}>
                Solo ofertas
              </Ficha>
            </div>
          </fieldset>

          {filtros && (
            <>
              <fieldset className={estilos.grupo}>
                <legend className={estilos.tituloGrupo}>Categoría</legend>
                <div className={estilos.fichas}>
                  {filtros.categorias.map((categoria) => (
                    <Ficha key={categoria.id} activa={categoria.id === categoriaId} onClick={() => elegirCategoria(categoria.id)}>
                      {categoria.nombre}
                    </Ficha>
                  ))}
                </div>
              </fieldset>

              {gruposTalle.length > 0 && (
                <fieldset className={estilos.grupo}>
                  <legend className={estilos.tituloGrupo}>Talle</legend>
                  {gruposTalle.map((grupo) => (
                    <div key={grupo.tipo} className={estilos.grupoTalle}>
                      {gruposTalle.length > 1 && <p className={estilos.tipoTalle}>{grupo.etiqueta}</p>}
                      <div className={estilos.fichas}>
                        {grupo.talles.map((talle) => (
                          <Ficha key={talle.id} activa={talle.id === talleId} onClick={() => alternarParametro('talle', talle.id)}>
                            {talle.etiqueta}
                          </Ficha>
                        ))}
                      </div>
                    </div>
                  ))}
                </fieldset>
              )}

              <fieldset className={estilos.grupo}>
                <legend className={estilos.tituloGrupo}>Marca</legend>
                <div className={estilos.fichas}>
                  {filtros.marcas.map((marca) => (
                    <Ficha key={marca.id} activa={marca.id === marcaId} onClick={() => alternarParametro('marca', marca.id)}>
                      {marca.nombre}
                    </Ficha>
                  ))}
                </div>
              </fieldset>

              {filtros.precioMaximo !== null && (
                <div className={estilos.grupo}>
                  <label className={estilos.tituloGrupo} htmlFor="precio-catalogo">
                    Precio máximo
                  </label>
                  <input
                    id="precio-catalogo"
                    className={estilos.rango}
                    type="range"
                    min={precioPiso(filtros)}
                    max={precioTope(filtros)}
                    step={PASO_PRECIO}
                    value={precioBorrador ?? precioMaximo ?? precioTope(filtros)}
                    onChange={(evento) => setPrecioBorrador(Number(evento.target.value))}
                    onPointerUp={confirmarPrecio}
                    onKeyUp={confirmarPrecio}
                  />
                  <p className={estilos.textoPrecio}>Hasta {formatearPrecio(precioBorrador ?? precioMaximo ?? precioTope(filtros))}</p>
                </div>
              )}
            </>
          )}

          <button type="button" className="boton boton-blanco" style={{ justifyContent: 'center' }} onClick={limpiarFiltros} disabled={filtrosActivos === 0}>
            Limpiar filtros
          </button>
        </aside>

        <section aria-label="Productos" aria-busy={cargando}>
          <div className={estilos.barraHerramientas}>
            <label htmlFor="orden-catalogo" className={estilos.etiquetaOrden}>
              Ordenar por
            </label>
            <select id="orden-catalogo" className={estilos.entrada} value={orden} onChange={(evento) => cambiarParametro('orden', evento.target.value === 'recientes' ? null : evento.target.value)}>
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className={estilos.error} role="alert">
              {error}
            </p>
          )}

          {!resultado && cargando && (
            <div className={estilos.grilla}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={estilos.esqueleto} aria-hidden="true" />
              ))}
            </div>
          )}

          {productos.length > 0 && (
            <div className={cargando ? `${estilos.grilla} ${estilos.cargando}` : estilos.grilla}>
              {productos.map((producto, i) => (
                <TarjetaProducto key={producto.id} producto={producto} demora={i * 60} />
              ))}
            </div>
          )}

          {resultado && productos.length === 0 && !error && (
            <div className={estilos.vacio}>
              <p className={`display ${estilos.tituloVacio}`}>¡Uy! Sin resultados</p>
              <p className={estilos.textoVacio}>No hay productos con esos filtros.</p>
              <button type="button" className="boton" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}

          {totalPaginas > 1 && (
            <nav className={estilos.paginador} aria-label="Páginas">
              <button type="button" className="boton boton-blanco" onClick={() => cambiarParametro('pagina', pagina - 1)} disabled={pagina <= 1}>
                Anterior
              </button>
              <span className={estilos.textoPagina}>
                Página {pagina} de {totalPaginas}
              </span>
              <button type="button" className="boton boton-blanco" onClick={() => cambiarParametro('pagina', pagina + 1)} disabled={pagina >= totalPaginas}>
                Siguiente
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  )
}

// Límites del slider redondeados al paso de $5.000
function precioPiso(filtros) {
  return Math.floor(Number(filtros.precioMinimo) / PASO_PRECIO) * PASO_PRECIO
}

function precioTope(filtros) {
  return Math.ceil(Number(filtros.precioMaximo) / PASO_PRECIO) * PASO_PRECIO
}

export default Catalogo
