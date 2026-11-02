import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { obtenerPedidosAdmin } from '../../api/admin'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import Icono from '../Icono/Icono'
import estilos from './PlantillaAdmin.module.css'

const SECCIONES = [
  { ruta: '/admin', etiqueta: 'Pedidos', icono: 'recibo', coincide: (camino) => camino === '/admin' || camino.startsWith('/admin/pedidos') },
  { ruta: '/admin/productos', etiqueta: 'Productos', icono: 'camiseta' },
  { ruta: '/admin/catalogo', etiqueta: 'Marcas y categorías', icono: 'etiquetas' },
  { ruta: '/admin/usuarios', etiqueta: 'Usuarios', icono: 'usuarios' },
  { ruta: '/admin/ajustes', etiqueta: 'Ajustes', icono: 'ajustes' },
]

/**
 * Estructura del panel: barra negra arriba, menú lateral amarillo y la pantalla elegida.
 * Solo entra un administrador; el backend igual rechaza cualquier llamada de otro rol.
 */
function PlantillaAdmin() {
  const navegar = useNavigate()
  const { pathname } = useLocation()
  const { usuario, estaLogueado, esAdmin, cerrarSesion } = useAutenticacion()
  const [paraPreparar, setParaPreparar] = useState(null) // pedidos pagados sin armar (número del menú)
  const [saliendo, setSaliendo] = useState(false)

  // Se actualiza al cambiar de pantalla, así refleja los pedidos que se fueron preparando
  useEffect(() => {
    if (!esAdmin) {
      return
    }
    const controlador = new AbortController()
    obtenerPedidosAdmin({ estado: 'PAGADO', tamanioPagina: 1 }, controlador.signal)
      .then((pagina) => setParaPreparar(pagina.totalElementos))
      .catch(() => {}) // el número es informativo: si falla, no se muestra
    return () => controlador.abort()
  }, [esAdmin, pathname])

  if (!estaLogueado) {
    return saliendo ? null : <Navigate to="/ingresar" replace state={{ desde: pathname }} />
  }
  if (!esAdmin) {
    return <Navigate to="/" replace />
  }

  const alSalir = () => {
    setSaliendo(true)
    cerrarSesion()
    navegar('/')
  }

  const iniciales = `${usuario.nombre[0] ?? ''}${usuario.apellido[0] ?? ''}`.toUpperCase()

  return (
    <div className={estilos.pagina}>
      <header className={estilos.superior}>
        <Link to="/admin" className={estilos.marca}>
          <span className={estilos.pelota} aria-hidden="true">
            G
          </span>
          <span className="display">Golden Point</span>
          <span className={estilos.etiqueta}>Panel</span>
        </Link>
        <div className={estilos.accionesSuperiores}>
          <Link to="/" className={estilos.enlaceSuperior}>
            <Icono nombre="tienda" tamanio={16} />
            <span className={estilos.ocultarChico}>Ver tienda</span>
          </Link>
          <span className={estilos.yo} title={usuario.email}>
            <span className={estilos.avatar} aria-hidden="true">
              {iniciales}
            </span>
            <span className={estilos.ocultarChico}>{usuario.nombre}</span>
          </span>
          <button type="button" className={estilos.enlaceSuperior} onClick={alSalir}>
            <Icono nombre="salir" tamanio={16} />
            <span className={estilos.ocultarChico}>Salir</span>
          </button>
        </div>
      </header>

      <div className={estilos.cuerpo}>
        <nav className={estilos.lateral} aria-label="Secciones del panel">
          <span className={estilos.tituloLateral}>Gestión</span>
          {SECCIONES.map((seccion) => (
            <NavLink
              key={seccion.ruta}
              to={seccion.ruta}
              className={({ isActive }) => {
                const activa = seccion.coincide ? seccion.coincide(pathname) : isActive
                return activa ? `${estilos.itemMenu} ${estilos.itemActivo}` : estilos.itemMenu
              }}
            >
              <Icono nombre={seccion.icono} />
              <span>{seccion.etiqueta}</span>
              {seccion.icono === 'recibo' && paraPreparar > 0 && (
                <span className={estilos.contador} aria-label={`${paraPreparar} para preparar`}>
                  {paraPreparar}
                </span>
              )}
            </NavLink>
          ))}
          <span className={estilos.sesion}>Sesión: {usuario.email}</span>
        </nav>

        <main className={estilos.contenido}>
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}

export default PlantillaAdmin
