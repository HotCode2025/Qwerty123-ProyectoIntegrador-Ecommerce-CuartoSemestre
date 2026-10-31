import { Outlet, ScrollRestoration } from 'react-router'
import { useAjustesTienda } from '../../contexto/contextoAjustes'
import { textoEnvioGratis } from '../../utilidades/tienda'
import Encabezado from '../Encabezado/Encabezado'
import PiePagina from '../PiePagina/PiePagina'
import estilos from './Plantilla.module.css'

// Estructura común de todas las pantallas: franja superior, encabezado, contenido y pie
function Plantilla() {
  const { ajustes } = useAjustesTienda()

  return (
    <div className={estilos.pagina}>
      <p className={estilos.franjaSuperior}>
        {ajustes && `${textoEnvioGratis(ajustes)} · `}Camisetas con tu nombre y número
      </p>
      <Encabezado />
      <div className={estilos.contenido}>
        <Outlet />
      </div>
      <PiePagina />
      {/* Al cambiar de pantalla vuelve arriba (y al ir "atrás" recupera la posición) */}
      <ScrollRestoration />
    </div>
  )
}

export default Plantilla
