import estilos from './PiePagina.module.css'

const ANIO = new Date().getFullYear()

function PiePagina() {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.interior}>
        <span className={`display ${estilos.marca}`}>Golden Point</span>
        <span>Fútbol, básquet y pádel · Precios en pesos argentinos</span>
        <span>© {ANIO} Grupo QWERTY123</span>
      </div>
    </footer>
  )
}

export default PiePagina
