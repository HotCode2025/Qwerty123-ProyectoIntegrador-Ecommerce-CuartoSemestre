// Íconos de línea del panel (24×24, toman el color del texto). Se agregan acá a medida que hacen falta
const TRAZOS = {
  recibo: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3',
  camiseta: 'M8 3L3 6l2 5 3-1v11h8V10l3 1 2-5-5-3c-1 2-2.5 3-4 3S9 5 8 3z',
  etiquetas: 'M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01',
  usuarios: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M16 3.5a4 4 0 0 1 0 7.5M18 15c2.5.5 4 2.5 4 6',
  tienda: 'M3 9l2-5h14l2 5M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9zM5 13v8h14v-8M10 21v-5h4v5',
  salir: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
  actualizar: 'M20 11a8 8 0 0 0-14.5-4.5M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5M20 20v-4h-4',
  flechaIzquierda: 'M15 6l-6 6 6 6',
  flechaDerecha: 'M9 6l6 6-6 6',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  usuario: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  camion: 'M3 6h11v10H3zM14 9h4l3 3v4h-7M7.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  paquete: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  tilde: 'M5 13l4 4L19 7',
  prohibido: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  cerrar: 'M6 6l12 12M18 6L6 18',
  correo: 'M3 6h18v12H3zM3 7l9 6 9-6',
  telefono: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  tarjeta: 'M3 6h18v12H3zM3 10h18M7 15h3',
  mas: 'M12 5v14M5 12h14',
  editar: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  basura: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  foto: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
  subir: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  pila: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  campana: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0',
  alerta: 'M12 4l9 16H3l9-16zM12 10v4M12 17h.01',
  guardar: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
  estrella: 'M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.6 7.1 19.2 8 13.7 4 9.8l5.5-.8L12 4z',
  premio: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14L7 21l5-3 5 3-1.5-7',
  categoria: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  ajustes: 'M4 6h9M17 6h3M15 4v4M4 12h3M11 12h9M9 10v4M4 18h11M19 18h1M17 16v4',
}

function Icono({ nombre, tamanio = 18, className }) {
  return (
    <svg
      className={className}
      width={tamanio}
      height={tamanio}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  )
}

export default Icono
