import { Link } from 'react-router'
import estilos from './NoEncontrada.module.css'

function NoEncontrada() {
  return (
    <main className={`contenedor ${estilos.caja}`}>
      <p className={`display ${estilos.codigo}`}>404</p>
      <h1 className={`display ${estilos.titulo}`}>¡Afuera!</h1>
      <p className={estilos.texto}>La página que buscás no existe o se fue de la cancha.</p>
      <Link to="/" className="boton">
        Volver al inicio
      </Link>
    </main>
  )
}

export default NoEncontrada
