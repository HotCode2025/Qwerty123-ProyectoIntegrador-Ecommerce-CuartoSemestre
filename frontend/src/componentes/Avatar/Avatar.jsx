const COLORES = ['var(--celeste)', 'var(--verde)', 'var(--naranja)', 'var(--amarillo)', 'var(--crema)']

/** Círculo con las iniciales de una persona; el color sale del id para que siempre sea el mismo. */
function Avatar({ id, nombre = '', apellido = '', tamanio = 32, apagado = false }) {
  const iniciales = `${nombre.trim()[0] ?? ''}${apellido.trim()[0] ?? ''}`.toUpperCase()
  return (
    <span
      aria-hidden="true"
      style={{
        width: tamanio,
        height: tamanio,
        flex: 'none',
        borderRadius: '50%',
        border: '2px solid var(--tinta)',
        background: apagado ? '#ededed' : COLORES[Number(id) % COLORES.length],
        display: 'grid',
        placeItems: 'center',
        fontSize: Math.round(tamanio * 0.38),
        fontWeight: 700,
      }}
    >
      {iniciales}
    </span>
  )
}

export default Avatar
