import { useState } from 'react'
import { Navigate } from 'react-router'
import { crearPedido } from '../../api/pedidos'
import ResumenCompra from '../../componentes/ResumenCompra/ResumenCompra'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import { useCarrito } from '../../contexto/contextoCarrito'
import { useCotizacionCarrito } from '../../hooks/useCotizacionCarrito'
import { PROVINCIAS } from '../../utilidades/provincias'
import estilos from './FinalizarCompra.module.css'

// Campos de la dirección: el backend devuelve los errores como "envio.calle", "envio.ciudad"…
const CAMPOS = [
  { nombre: 'calle', etiqueta: 'Calle y número', ejemplo: 'Av. San Martín 1234', autocompletar: 'street-address', largoMaximo: 150, ancho: true },
  { nombre: 'ciudad', etiqueta: 'Ciudad', ejemplo: 'San Rafael', autocompletar: 'address-level2', largoMaximo: 80 },
  { nombre: 'provincia', etiqueta: 'Provincia', desplegable: true },
  { nombre: 'codigoPostal', etiqueta: 'Código postal', ejemplo: '5600', autocompletar: 'postal-code', largoMaximo: 10 },
  { nombre: 'telefono', etiqueta: 'Teléfono', ejemplo: '260 412 3456', autocompletar: 'tel', tipo: 'tel', largoMaximo: 30 },
  { nombre: 'indicaciones', etiqueta: 'Indicaciones para la entrega (opcional)', ejemplo: 'Timbre 2B, dejar en portería', largoMaximo: 255, ancho: true, opcional: true },
]

function FinalizarCompra() {
  const { usuario, estaLogueado } = useAutenticacion()
  const { items } = useCarrito()
  const { cotizacion, cargando, error: errorCotizacion } = useCotizacionCarrito(items)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampos, setErroresCampos] = useState({})

  if (!estaLogueado) {
    return <Navigate to="/ingresar" replace state={{ desde: '/finalizar-compra', motivo: 'compra' }} />
  }
  if (items.length === 0) {
    return <Navigate to="/carrito" replace />
  }

  const alEnviar = (evento) => {
    evento.preventDefault()
    const envio = Object.fromEntries(new FormData(evento.currentTarget))
    envio.indicaciones = envio.indicaciones.trim() || null
    setEnviando(true)
    setError('')
    setErroresCampos({})
    crearPedido(items, envio)
      .then((pedido) => {
        // El carrito se vacía recién cuando el pago se confirma (pantalla de resultado)
        window.location.assign(pedido.urlPago)
      })
      .catch((err) => {
        setError(err.message)
        setErroresCampos(err.errores ?? {})
        setEnviando(false)
      })
  }

  const errorDe = (nombre) => erroresCampos[`envio.${nombre}`]
  const puedePagar = cotizacion !== null && cotizacion.valida && !cargando && !errorCotizacion && !enviando

  return (
    <main className={`contenedor ${estilos.pantalla}`}>
      <h1 className={`display ${estilos.titulo}`}>¿A dónde lo mandamos?</h1>
      <form className={estilos.disposicion} onSubmit={alEnviar}>
        <div className={estilos.caja}>
          <div className={estilos.grilla}>
            {CAMPOS.map((campo) => {
              const errorCampo = errorDe(campo.nombre)
              const comunes = {
                id: campo.nombre,
                name: campo.nombre,
                className: 'entrada',
                'aria-invalid': errorCampo ? true : undefined,
                'aria-describedby': errorCampo ? `${campo.nombre}-error` : undefined,
              }
              return (
                <div key={campo.nombre} className={campo.ancho ? `campo ${estilos.ancho}` : 'campo'}>
                  <label htmlFor={campo.nombre}>{campo.etiqueta}</label>
                  {campo.desplegable ? (
                    <select {...comunes} required defaultValue="">
                      <option value="" disabled>
                        Elegí una provincia
                      </option>
                      {PROVINCIAS.map((provincia) => (
                        <option key={provincia}>{provincia}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...comunes}
                      type={campo.tipo ?? 'text'}
                      required={!campo.opcional}
                      maxLength={campo.largoMaximo}
                      placeholder={campo.ejemplo}
                      autoComplete={campo.autocompletar}
                      defaultValue={campo.nombre === 'telefono' ? (usuario.telefono ?? '') : undefined}
                    />
                  )}
                  {errorCampo && (
                    <p id={`${campo.nombre}-error`} className="error-campo">
                      {errorCampo}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <ResumenCompra
          titulo="Tu pedido"
          cotizacion={cotizacion}
          cargando={cargando}
          acciones={
            <>
              {(error || errorCotizacion) && Object.keys(erroresCampos).length === 0 && (
                <p className="alerta-error" role="alert">
                  {error || errorCotizacion}
                </p>
              )}
              {cotizacion && !cotizacion.valida && <p className={estilos.advertencia}>Hay productos sin stock en tu carrito. Volvé al carrito para revisarlos.</p>}
              <button type="submit" className={`boton ${estilos.botonMercadoPago}`} disabled={!puedePagar}>
                {enviando ? 'Te llevamos a Mercado Pago…' : 'Pagar con Mercado Pago'}
              </button>
              <p className={estilos.nota}>Te llevamos a Mercado Pago para pagar. Los datos de tu tarjeta nunca pasan por Golden Point.</p>
            </>
          }
        />
      </form>
    </main>
  )
}

export default FinalizarCompra
