import { Link } from 'react-router'
import { formatearPrecio } from '../../utilidades/formato'
import { deportePorValor, tipoIlustracion } from '../../utilidades/deportes'
import { porcentajeDescuento } from '../../utilidades/tienda'
import IlustracionProducto from '../IlustracionProducto/IlustracionProducto'
import estilos from './TarjetaProducto.module.css'

// Tarjeta de producto del inicio y del catálogo. producto es un ProductoResumenDTO del backend
function TarjetaProducto({ producto, demora = 0 }) {
  const deporte = deportePorValor(producto.deporte)

  return (
    <Link to={`/producto/${producto.id}`} className={estilos.tarjeta} style={{ animationDelay: `${demora}ms` }}>
      <span className={estilos.imagen}>
        {producto.imagenUrl ? (
          <img className={estilos.foto} src={producto.imagenUrl} alt="" loading="lazy" />
        ) : (
          <IlustracionProducto tipo={tipoIlustracion(producto.categoriaNombre)} className={estilos.ilustracion} />
        )}
        <span className={estilos.etiqueta} style={{ background: deporte?.color }}>{deporte?.etiqueta}</span>
        {producto.precioOferta && (
          <span className={estilos.descuento}>-{porcentajeDescuento(producto.precio, producto.precioOferta)}%</span>
        )}
        {!producto.conStock && <span className={`${estilos.sello} ${estilos.agotado}`}>Sin stock</span>}
        {producto.conStock && producto.personalizable && <span className={estilos.sello}>Personalizable</span>}
      </span>
      <span className={estilos.cuerpo}>
        <span className="chico">
          {producto.marcaNombre} · {producto.categoriaNombre}
        </span>
        <span className={estilos.nombre}>{producto.nombre}</span>
        <span className={estilos.precios}>
          {producto.precioOferta && <span className={estilos.precioAnterior}>{formatearPrecio(producto.precio)}</span>}
          <span className={`display ${estilos.precio}`}>{formatearPrecio(producto.precioOferta ?? producto.precio)}</span>
        </span>
      </span>
    </Link>
  )
}

export default TarjetaProducto
