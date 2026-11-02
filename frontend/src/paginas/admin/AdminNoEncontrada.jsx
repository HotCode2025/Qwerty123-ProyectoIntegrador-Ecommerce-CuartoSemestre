import { Link } from 'react-router'
import estilos from './admin.module.css'

// Rutas del panel que no existen (o secciones que todavía no se armaron)
function AdminNoEncontrada() {
  return (
    <div className={estilos.vacio}>
      <p className={`display ${estilos.tituloVacio}`}>Esta sección no existe</p>
      <p className={estilos.tenue}>Revisá la dirección o volvé a los pedidos.</p>
      <Link to="/admin" className="boton" style={{ marginTop: 16 }}>
        Ir a pedidos
      </Link>
    </div>
  )
}

export default AdminNoEncontrada
