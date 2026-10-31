import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { useCarrito } from '../../contexto/contextoCarrito'
import { DEPORTES } from '../../utilidades/deportes'
import estilos from './Encabezado.module.css'

// Catálogo completo + un acceso por deporte
const ENLACES = [
  { ruta: '/catalogo', etiqueta: 'Catálogo', slug: null },
  ...DEPORTES.map((deporte) => ({ ruta: `/catalogo?deporte=${deporte.slug}`, etiqueta: deporte.etiqueta, slug: deporte.slug })),
]

function Encabezado() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname, search } = useLocation()
  const { estaLogueado, esAdmin } = useAutenticacion()
  const { cantidad } = useCarrito()

  const deporteActual = new URLSearchParams(search).get('deporte')
  const estaActivo = (enlace) => pathname === '/catalogo' && deporteActual === enlace.slug
  const rutaCuenta = !estaLogueado ? '/ingresar' : esAdmin ? '/admin' : '/mis-pedidos'
  const etiquetaCuenta = !estaLogueado ? 'Ingresar' : esAdmin ? 'Panel de administración' : 'Mis pedidos'
  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <header>
      <div className={`contenedor ${estilos.barra}`}>
        <Link to="/" className={estilos.logo} aria-label="Golden Point, ir al inicio" onClick={cerrarMenu}>
          <span className={estilos.logoPelota} aria-hidden="true">G</span>
          <span className={`display ${estilos.logoTexto}`}>Golden Point</span>
        </Link>

        <nav className={estilos.menu} aria-label="Principal">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.etiqueta}
              to={enlace.ruta}
              className={estaActivo(enlace) ? `${estilos.enlaceMenu} ${estilos.activo}` : estilos.enlaceMenu}
              aria-current={estaActivo(enlace) ? 'page' : undefined}
            >
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>

        <div className={estilos.acciones}>
          <Link to={rutaCuenta} className={estilos.botonIcono} aria-label={etiquetaCuenta} onClick={cerrarMenu}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </Link>
          <Link to="/carrito" className={estilos.botonIcono} aria-label={cantidad === 1 ? 'Ver carrito, 1 producto' : `Ver carrito, ${cantidad} productos`} onClick={cerrarMenu}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8a3 3 0 0 1 6 0" />
            </svg>
            {cantidad > 0 && <span className={estilos.burbuja} aria-hidden="true">{cantidad}</span>}
          </Link>
          <button
            type="button"
            className={`${estilos.botonIcono} ${estilos.hamburguesa}`}
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              {menuAbierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav id="menu-movil" className={estilos.menuMovil} aria-label="Menú móvil">
          {ENLACES.map((enlace) => (
            <Link key={enlace.etiqueta} to={enlace.ruta} onClick={cerrarMenu}>
              {enlace.etiqueta}
            </Link>
          ))}
          <Link to={rutaCuenta} onClick={cerrarMenu}>
            {etiquetaCuenta}
          </Link>
        </nav>
      )}
    </header>
  )
}

export default Encabezado
