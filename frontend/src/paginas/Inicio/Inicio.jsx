import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { obtenerProductos } from '../../api/productos'
import IlustracionProducto from '../../componentes/IlustracionProducto/IlustracionProducto'
import TarjetaProducto from '../../componentes/TarjetaProducto/TarjetaProducto'
import { useAjustesTienda } from '../../contexto/contextoAjustes'
import { formatearPrecio } from '../../utilidades/formato'
import { textoEnvioGratis } from '../../utilidades/tienda'
import { DEPORTES } from '../../utilidades/deportes'
import estilos from './Inicio.module.css'

const CANTIDAD_DESTACADOS = 4

// El recargo sale de los ajustes de la tienda (se cambia desde el panel)
const pasos = (ajustes) => [
  { titulo: 'Elegí talle', texto: 'Camisetas de fútbol y básquet, de S a XXL.', color: 'var(--crema)' },
  { titulo: 'Poné tu nombre', texto: 'Hasta 12 letras, en la espalda y sobre el número.', color: 'var(--menta)' },
  {
    titulo: 'Sumá el número',
    texto: ajustes ? `Del 1 al 99. Recargo fijo de ${formatearPrecio(ajustes.recargoPersonalizacion)} por unidad.` : 'Del 1 al 99.',
    color: 'var(--hielo)',
  },
]

// Textos de las franjas animadas: se repiten para que el loop no tenga cortes
const FRANJA_DEPORTES = Array(4).fill(['Fútbol', 'Básquet', 'Pádel']).flat()
const franjaInfo = (ajustes) =>
  Array(3)
    .fill(ajustes ? [textoEnvioGratis(ajustes), 'Pagá con Mercado Pago'] : ['Pagá con Mercado Pago', 'Camisetas con tu nombre'])
    .flat()

const IconoFlecha = ({ tamanio = 20 }) => (
  <svg width={tamanio} height={tamanio} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const textoProductos = (cantidad) => (cantidad === 1 ? '1 producto' : `${cantidad} productos`)

function Inicio() {
  const { ajustes } = useAjustesTienda()
  const [destacados, setDestacados] = useState([])
  const [cantidadPorDeporte, setCantidadPorDeporte] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()
    // Destacados + cuántos productos hay de cada deporte (solo se necesita el total, por eso tamanioPagina 1)
    Promise.all([
      obtenerProductos({ destacado: true, tamanioPagina: CANTIDAD_DESTACADOS }, controlador.signal),
      ...DEPORTES.map((deporte) => obtenerProductos({ deporte: deporte.valor, tamanioPagina: 1 }, controlador.signal)),
    ])
      .then(([paginaDestacados, ...paginasDeporte]) => {
        setDestacados(paginaDestacados.contenido)
        setCantidadPorDeporte(Object.fromEntries(DEPORTES.map((deporte, i) => [deporte.valor, paginasDeporte[i].totalElementos])))
        setCargando(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setCargando(false)
        }
      })
    return () => controlador.abort()
  }, [])

  // "Personalizar camiseta" lleva a la primera camiseta personalizable destacada; si no hay, al catálogo
  const productoPersonalizable = destacados.find((producto) => producto.personalizable)
  const rutaPersonalizar = productoPersonalizable ? `/producto/${productoPersonalizable.id}` : '/catalogo'

  return (
    <main className={estilos.pantalla}>
      <section className={`contenedor ${estilos.portada}`}>
        <div>
          <h1 className={`display ${estilos.tituloPortada}`}>
            <span className={`${estilos.bloque} ${estilos.bloqueAmarillo}`}>¡A la</span>
            <br />
            <span className={`${estilos.bloque} ${estilos.bloqueVerde}`}>cancha!</span>
          </h1>
          <p className={estilos.bajada}>
            Fútbol, básquet y pádel en un solo lugar. Buscá por deporte y talle, poné tu nombre en la camiseta y
            recibila en tu casa.
          </p>
          <div className={estilos.botones}>
            <Link to="/catalogo" className="boton">
              Ver catálogo <IconoFlecha />
            </Link>
            <Link to={rutaPersonalizar} className="boton boton-blanco">
              Personalizar camiseta
            </Link>
          </div>
        </div>
        <div className={estilos.cancha} aria-hidden="true">
          <div className={estilos.lineasCancha} />
          <div className={estilos.mitadCancha} />
          <div className={estilos.circuloCancha} />
          <div className={estilos.sombra} />
          <div className={estilos.pelota} />
          <span className={estilos.calco} style={{ top: '10%', left: '6%' }}>
            Talles S a XXL
          </span>
          <span className={estilos.calco} style={{ bottom: '9%', right: '6%', background: 'var(--amarillo)', animationDelay: '1.2s' }}>
            Nombre + número
          </span>
          <span className={estilos.calco} style={{ bottom: '22%', left: '8%', background: 'var(--verde)', animationDelay: '2.1s' }}>
            3 deportes
          </span>
        </div>
      </section>

      <div className={estilos.franjas} aria-hidden="true">
        <div className={`${estilos.franja} ${estilos.franjaAmarilla}`}>
          <div className={estilos.pistaFranja}>
            {FRANJA_DEPORTES.map((texto, i) => (
              <span key={i}>{texto} ★</span>
            ))}
          </div>
        </div>
        <div className={`${estilos.franja} ${estilos.franjaNegra}`}>
          <div className={estilos.pistaFranja}>
            {franjaInfo(ajustes).map((texto, i) => (
              <span key={i}>{texto} ●</span>
            ))}
          </div>
        </div>
      </div>

      <section className={estilos.seccion}>
        <div className="contenedor">
          <div className={estilos.cabeceraSeccion}>
            <h2 className={`display ${estilos.subtitulo}`}>¿Qué jugás?</h2>
            <p className={estilos.textoSeccion}>Pasá por cada deporte para ver qué tiene y entrá directo a su catálogo.</p>
          </div>
          <div className={estilos.acordeon}>
            {DEPORTES.map((deporte, i) => (
              <Link
                key={deporte.valor}
                to={`/catalogo?deporte=${deporte.slug}`}
                className={estilos.panel}
                style={{ background: deporte.color }}
              >
                <IlustracionProducto tipo={deporte.ilustracion} className={estilos.ilustracionPanel} />
                <span className={estilos.superiorPanel}>
                  <span className={estilos.numeroPanel}>0{i + 1}</span>
                  {cantidadPorDeporte[deporte.valor] !== undefined && (
                    <span className="pastilla">{textoProductos(cantidadPorDeporte[deporte.valor])}</span>
                  )}
                </span>
                <span className={estilos.nombrePanel}>{deporte.etiqueta}</span>
                <span className={estilos.masPanel}>
                  <span className={estilos.itemsPanel}>
                    {deporte.items.map((item) => (
                      <span key={item} className="pastilla">
                        {item}
                      </span>
                    ))}
                  </span>
                  <span className={estilos.irPanel} aria-hidden="true">
                    <IconoFlecha tamanio={26} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={estilos.seccion} style={{ paddingTop: 24 }}>
        <div className="contenedor">
          <div className={estilos.cabeceraSeccion}>
            <h2 className={`display ${estilos.subtitulo}`}>Lo más buscado</h2>
            <Link to="/catalogo" className="boton boton-blanco">
              Ver todo
            </Link>
          </div>
          {error && (
            <p className={estilos.error} role="alert">
              {error}
            </p>
          )}
          <div className={estilos.grilla}>
            {cargando &&
              Array.from({ length: CANTIDAD_DESTACADOS }, (_, i) => <div key={i} className={estilos.esqueleto} aria-hidden="true" />)}
            {destacados.map((producto, i) => (
              <TarjetaProducto key={producto.id} producto={producto} demora={i * 90} />
            ))}
          </div>
        </div>
      </section>

      <section className={estilos.seccion}>
        <div className="contenedor">
          <div className={estilos.cabeceraSeccion}>
            <h2 className={`display ${estilos.subtitulo}`}>Tu camiseta en 3 pasos</h2>
          </div>
          <ol className={estilos.pasos}>
            {pasos(ajustes).map((paso, i) => (
              <li key={paso.titulo} className={estilos.paso} style={{ background: paso.color }}>
                <span className={estilos.numeroPaso} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={`display ${estilos.tituloPaso}`}>{paso.titulo}</h3>
                <p className={estilos.textoPaso}>{paso.texto}</p>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 36 }}>
            <Link to={rutaPersonalizar} className="boton boton-negro">
              Personalizar ahora
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Inicio
