import estilos from '../../paginas/admin/admin.module.css'
import Icono from '../Icono/Icono'

/** Pie de las tablas del panel: "Mostrando 1–20 de 45 pedidos" y los botones de página. pagina empieza en 1. */
function Paginador({ pagina, totalPaginas, totalElementos, tamanioPagina, sustantivo, alCambiar }) {
  const desde = (pagina - 1) * tamanioPagina + 1
  const hasta = Math.min(pagina * tamanioPagina, totalElementos)
  const nombre = totalElementos === 1 ? sustantivo[0] : sustantivo[1]

  return (
    <div className={estilos.pie}>
      <span className={estilos.tenue}>
        Mostrando {desde}–{hasta} de {totalElementos} {nombre}
      </span>
      {totalPaginas > 1 && (
        <nav className={estilos.paginador} aria-label="Páginas">
          <button type="button" className={estilos.botonFila} onClick={() => alCambiar(pagina - 1)} disabled={pagina <= 1} aria-label="Página anterior">
            <Icono nombre="flechaIzquierda" />
          </button>
          <span className={estilos.paginaActual}>
            {pagina} de {totalPaginas}
          </span>
          <button type="button" className={estilos.botonFila} onClick={() => alCambiar(pagina + 1)} disabled={pagina >= totalPaginas} aria-label="Página siguiente">
            <Icono nombre="flechaDerecha" />
          </button>
        </nav>
      )}
    </div>
  )
}

export default Paginador
