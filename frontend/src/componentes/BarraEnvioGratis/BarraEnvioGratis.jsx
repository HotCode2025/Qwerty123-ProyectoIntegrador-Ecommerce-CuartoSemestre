import { formatearPrecio } from '../../utilidades/formato'
import estilos from './BarraEnvioGratis.module.css'

// Cinco pentágonos alrededor del central de la pelota de fútbol
const PENTAGONO = '0,-6 5.71,-1.85 3.53,4.85 -3.53,4.85 -5.71,-1.85'
const PENTAGONOS_EXTERIORES = [
  'translate(20 2.5) rotate(-180)',
  'translate(36.64 14.59) rotate(-108)',
  'translate(30.29 34.16) rotate(-36)',
  'translate(9.71 34.16) rotate(36)',
  'translate(3.36 14.59) rotate(108)',
]

/**
 * Barra de avance hacia el envío gratis: una pelota rueda en la punta alternando
 * fútbol, básquet y pádel, y pica cuando se llega al monto.
 */
function BarraEnvioGratis({ envioGratisDesde, faltanteEnvioGratis }) {
  const desde = Number(envioGratisDesde)
  const faltante = Number(faltanteEnvioGratis)
  const porcentaje = Math.min(100, Math.max(0, Math.round(((desde - faltante) / desde) * 100)))
  const esGratis = faltante <= 0

  return (
    <div>
      <div
        className={esGratis ? `${estilos.cancha} ${estilos.gratis}` : estilos.cancha}
        role="progressbar"
        aria-label="Avance hacia el envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
      >
        <span className={estilos.recorte}>
          <span className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
        </span>
        <span className={estilos.pelota} style={{ left: `${porcentaje}%` }} aria-hidden="true">
          <span className={estilos.giro}>
            <svg viewBox="0 0 40 40">
              <defs>
                <clipPath id="gp-pelota-futbol">
                  <circle cx="20" cy="20" r="17" />
                </clipPath>
              </defs>
              <circle cx="20" cy="20" r="17" fill="#FFFFFF" />
              <g clipPath="url(#gp-pelota-futbol)" fill="#111111" stroke="#111111" strokeWidth="1.6">
                <polygon points={PENTAGONO} transform="translate(20 20) scale(1.17)" />
                {PENTAGONOS_EXTERIORES.map((transformacion) => (
                  <polygon key={transformacion} points={PENTAGONO} transform={transformacion} />
                ))}
                <path d="M20 13V8.5M26.66 17.84L30.94 16.45M24.11 25.66L26.76 29.3M15.89 25.66L13.24 29.3M13.34 17.84L9.06 16.45" fill="none" />
              </g>
              <circle cx="20" cy="20" r="17" fill="none" stroke="#111111" strokeWidth="2.5" />
            </svg>
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="17" fill="#FF7A2F" stroke="#111111" strokeWidth="2.5" />
              <path d="M3 20h34M20 3v34M8 8c5.5 5 5.5 19 0 24M32 8c-5.5 5-5.5 19 0 24" fill="none" stroke="#111111" strokeWidth="2" />
            </svg>
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="17" fill="#D9F24A" stroke="#111111" strokeWidth="2.5" />
              <path d="M6 12c7 2 9 14 2 18M34 12c-7 2-9 14-2 18" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </div>
      <p className={estilos.mensaje}>
        {esGratis ? '¡Tenés envío gratis!' : `Te faltan ${formatearPrecio(faltante)} para el envío gratis.`}
      </p>
    </div>
  )
}

export default BarraEnvioGratis
