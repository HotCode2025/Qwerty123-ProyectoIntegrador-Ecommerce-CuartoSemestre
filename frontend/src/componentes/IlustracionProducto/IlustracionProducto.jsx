// Ilustración de línea para productos sin foto (y para las tarjetas de deporte). tipo: camiseta, calzado, pelota o paleta
function IlustracionProducto({ tipo, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {tipo === 'camiseta' && (
        <>
          <path d="M36 12 L22 18 L8 34 L20 44 L26 38 L26 90 L74 90 L74 38 L80 44 L92 34 L78 18 L64 12 Q50 24 36 12 Z" />
          <path d="M40 14 Q50 22 60 14" />
          <path d="M42 50 L42 74 M52 50 L60 50 L60 62 L52 62 L52 74 L60 74" />
        </>
      )}
      {tipo === 'calzado' && (
        <>
          <path d="M8 66 L12 38 Q22 44 32 38 L46 52 Q64 58 82 60 Q94 62 94 72 L94 76 L8 76 Z" />
          <path d="M8 70 L94 70" />
          <path d="M34 44 L40 40 M39 49 L45 45 M45 54 L50 50" />
          <path d="M20 76 L20 82 M34 76 L34 82 M60 76 L60 82 M78 76 L78 82" />
        </>
      )}
      {tipo === 'pelota' && (
        <>
          <circle cx="50" cy="50" r="38" />
          <path d="M50 36 L63 45 L58 60 L42 60 L37 45 Z" />
          <path d="M50 36 L50 12 M63 45 L85 38 M58 60 L72 80 M42 60 L28 80 M37 45 L15 38" />
        </>
      )}
      {tipo === 'paleta' && (
        <>
          <path d="M50 6 C72 6 82 22 82 40 C82 58 68 70 56 72 L56 94 L44 94 L44 72 C32 70 18 58 18 40 C18 22 28 6 50 6 Z" />
          <circle cx="40" cy="30" r="2.5" />
          <circle cx="50" cy="26" r="2.5" />
          <circle cx="60" cy="30" r="2.5" />
          <circle cx="36" cy="42" r="2.5" />
          <circle cx="50" cy="40" r="2.5" />
          <circle cx="64" cy="42" r="2.5" />
          <circle cx="42" cy="54" r="2.5" />
          <circle cx="58" cy="54" r="2.5" />
          <path d="M44 82 L56 82" />
        </>
      )}
    </svg>
  )
}

export default IlustracionProducto
