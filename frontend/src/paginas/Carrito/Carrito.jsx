import { Link, useLocation, useNavigate } from 'react-router'
import BarraEnvioGratis from '../../componentes/BarraEnvioGratis/BarraEnvioGratis'
import IlustracionProducto from '../../componentes/IlustracionProducto/IlustracionProducto'
import ResumenCompra from '../../componentes/ResumenCompra/ResumenCompra'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { useCarrito } from '../../contexto/contextoCarrito'
import { useCotizacionCarrito } from '../../hooks/useCotizacionCarrito'
import { formatearPrecio } from '../../utilidades/formato'
import estilos from './Carrito.module.css'

// Busca en la cotización la línea que corresponde a un ítem del carrito
const buscarLineaCotizada = (cotizacion, item) =>
  cotizacion?.items.find(
    (linea) =>
      linea.productoId === item.productoId &&
      linea.talleId === item.talleId &&
      (linea.nombrePersonalizado ?? null) === (item.nombrePersonalizado ?? null) &&
      (linea.numeroPersonalizado ?? null) === (item.numeroPersonalizado ?? null),
  )

function Carrito() {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { estaLogueado } = useAutenticacion()
  const { items, cambiarCantidad, quitarItem } = useCarrito()
  const { cotizacion, cargando, error } = useCotizacionCarrito(items)

  // Viene de "Agregar al carrito" en la ficha
  const recienAgregado = ubicacion.state?.agregado === true
  const puedeFinalizar = cotizacion !== null && cotizacion.valida && !cargando && !error

  const irAFinalizar = () => {
    if (estaLogueado) {
      navegar('/finalizar-compra')
    } else {
      // Para comprar hace falta cuenta: después de ingresar sigue a finalizar la compra
      navegar('/ingresar', { state: { desde: '/finalizar-compra', motivo: 'compra' } })
    }
  }

  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <h1 className={`display ${estilos.titulo}`}>Tu carrito</h1>

      {recienAgregado && items.length > 0 && (
        <div className={estilos.cartel} role="status">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
          ¡Golazo! Producto agregado
        </div>
      )}

      {items.length === 0 ? (
        <div className={estilos.vacio}>
          <p className={`display ${estilos.tituloVacio}`}>Tu carrito está vacío</p>
          <p className={estilos.textoVacio}>Explorá el catálogo y armá tu equipo.</p>
          <Link to="/catalogo" className="boton">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className={estilos.disposicion}>
          <div className={estilos.lineas}>
            {error && (
              <p className="alerta-error" role="alert">
                {error}
              </p>
            )}
            {items.map((item, indice) => {
              const linea = buscarLineaCotizada(cotizacion, item)
              const tienePersonalizacion = item.nombrePersonalizado && item.numeroPersonalizado
              return (
                <div key={`${item.productoId}-${item.talleId}-${item.nombrePersonalizado}-${item.numeroPersonalizado}`} className={estilos.linea}>
                  <Link to={`/producto/${item.productoId}`} className={estilos.miniatura} aria-label={linea?.productoNombre ?? 'Ver producto'}>
                    {linea?.imagenUrl ? (
                      <img src={linea.imagenUrl} alt="" />
                    ) : (
                      <IlustracionProducto tipo={tienePersonalizacion ? 'camiseta' : 'pelota'} className={estilos.ilustracionMiniatura} />
                    )}
                  </Link>
                  <div className={estilos.infoLinea}>
                    <p className={estilos.nombreLinea}>{linea?.productoNombre ?? 'Cargando…'}</p>
                    {linea && <p className="chico">Talle {linea.talleEtiqueta}</p>}
                    {linea?.precioSinOferta != null && (
                      <p className={`chico ${estilos.oferta}`}>
                        En oferta: {formatearPrecio(linea.precioUnitario)} <s>{formatearPrecio(linea.precioSinOferta)}</s>
                      </p>
                    )}
                    {tienePersonalizacion && (
                      <p className={`chico ${estilos.personalizado}`}>
                        Personalizada: {item.nombrePersonalizado} · {item.numeroPersonalizado}
                        {Number(linea?.recargoUnitario) > 0 && ` (+${formatearPrecio(linea.recargoUnitario)} c/u)`}
                      </p>
                    )}
                    {linea?.problema && (
                      <p className="error-campo" role="alert">
                        {linea.problema}
                      </p>
                    )}
                  </div>
                  <div className={estilos.derechaLinea}>
                    <span className={`display ${estilos.totalLinea}`}>{linea?.totalLinea != null ? formatearPrecio(linea.totalLinea) : '—'}</span>
                    <div className={estilos.accionesLinea}>
                      <div className={estilos.cantidad}>
                        <button type="button" onClick={() => cambiarCantidad(indice, item.cantidad - 1)} disabled={item.cantidad <= 1} aria-label="Restar uno">
                          −
                        </button>
                        <span aria-live="polite">{item.cantidad}</span>
                        <button type="button" onClick={() => cambiarCantidad(indice, item.cantidad + 1)} disabled={item.cantidad >= 20} aria-label="Sumar uno">
                          +
                        </button>
                      </div>
                      <button type="button" className={estilos.quitar} onClick={() => quitarItem(indice)} aria-label="Quitar del carrito">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <ResumenCompra
            titulo="Resumen"
            cotizacion={cotizacion}
            cargando={cargando}
            acciones={
              <>
                {cotizacion && !cotizacion.valida && <p className={estilos.advertencia}>Revisá los productos marcados antes de seguir.</p>}
                <button type="button" className={`boton boton-negro ${estilos.botonFinalizar}`} onClick={irAFinalizar} disabled={!puedeFinalizar}>
                  Finalizar compra
                </button>
                <p className={estilos.nota}>Pagás con Mercado Pago. Necesitás una cuenta para comprar.</p>
              </>
            }
          >
            {cotizacion && <BarraEnvioGratis envioGratisDesde={cotizacion.envioGratisDesde} faltanteEnvioGratis={cotizacion.faltanteEnvioGratis} />}
          </ResumenCompra>
        </div>
      )}
    </main>
  )
}

export default Carrito
