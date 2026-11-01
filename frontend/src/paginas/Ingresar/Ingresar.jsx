import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ingresar, registrar } from '../../api/autenticacion'
import { useAutenticacion } from '../../contexto/contextoAutenticacion'
import estilos from './Ingresar.module.css'

// Mensajes de arriba del formulario según de dónde venga el cliente
const MOTIVOS = {
  compra: 'Para finalizar la compra, ingresá o creá una cuenta.',
  resultado: 'Ingresá con tu cuenta para ver el resultado de tu pago.',
}

function Campo({ id, etiqueta, error, ...propiedadesEntrada }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} name={id} className="entrada" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...propiedadesEntrada} />
      {error && (
        <p id={`${id}-error`} className="error-campo">
          {error}
        </p>
      )}
    </div>
  )
}

function Ingresar() {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { usuario, estaLogueado, esAdmin, iniciarSesion, cerrarSesion } = useAutenticacion()
  const [modo, setModo] = useState('ingreso') // ingreso o registro
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampos, setErroresCampos] = useState({})

  // A dónde volver después de ingresar (por ejemplo, finalizar la compra)
  const desde = ubicacion.state?.desde ?? '/'
  const motivo = MOTIVOS[ubicacion.state?.motivo]
  const esRegistro = modo === 'registro'

  const cambiarModo = (siguiente) => {
    setModo(siguiente)
    setError('')
    setErroresCampos({})
  }

  const alEnviar = (evento) => {
    evento.preventDefault()
    const datos = Object.fromEntries(new FormData(evento.currentTarget))
    setEnviando(true)
    setError('')
    setErroresCampos({})
    const peticion = esRegistro
      ? registrar({ ...datos, telefono: datos.telefono || null })
      : ingresar({ email: datos.email, contrasena: datos.contrasena })
    peticion
      .then((sesion) => {
        iniciarSesion(sesion)
        navegar(desde, { replace: true })
      })
      .catch((err) => {
        setError(err.message)
        setErroresCampos(err.errores ?? {})
        setEnviando(false)
      })
  }

  if (estaLogueado && !enviando) {
    return (
      <main className={`contenedor ${estilos.hecho}`}>
        <h1 className={`display ${estilos.tituloHecho}`}>¡Hola, {usuario.nombre}!</h1>
        <p className={estilos.textoHecho}>Ya ingresaste con {usuario.email}.</p>
        <div className={estilos.botones}>
          {esAdmin ? (
            <Link to="/admin" className="boton">
              Ir al panel
            </Link>
          ) : (
            <Link to="/mis-pedidos" className="boton">
              Mis pedidos
            </Link>
          )}
          <button type="button" className="boton boton-blanco" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={`contenedor ${estilos.acceso}`}>
      <div className={estilos.ilustracion} aria-hidden="true">
        <div className={estilos.lineasIlustracion} />
        <div className={estilos.sombra} />
        <div className={estilos.pelota} />
        <p className={`display ${estilos.textoIlustracion}`}>
          Entrá a
          <br />
          jugar
        </p>
      </div>

      <div className={estilos.tarjeta}>
        {motivo && (
          <div className={estilos.motivo} role="status">
            {motivo}
          </div>
        )}
        <h1 className="solo-lector">{esRegistro ? 'Crear cuenta' : 'Ingresar'}</h1>
        <div className={estilos.pestanias}>
          <button type="button" className={!esRegistro ? `${estilos.pestania} ${estilos.pestaniaActiva}` : estilos.pestania} aria-pressed={!esRegistro} onClick={() => cambiarModo('ingreso')}>
            Ingresar
          </button>
          <button type="button" className={esRegistro ? `${estilos.pestania} ${estilos.pestaniaActiva}` : estilos.pestania} aria-pressed={esRegistro} onClick={() => cambiarModo('registro')}>
            Crear cuenta
          </button>
        </div>

        <form key={modo} className={estilos.formulario} onSubmit={alEnviar}>
          {esRegistro && (
            <div className={estilos.fila}>
              <Campo id="nombre" etiqueta="Nombre" required maxLength={60} autoComplete="given-name" error={erroresCampos.nombre} />
              <Campo id="apellido" etiqueta="Apellido" required maxLength={60} autoComplete="family-name" error={erroresCampos.apellido} />
            </div>
          )}
          <Campo id="email" etiqueta="Email" type="email" required maxLength={120} autoComplete="email" placeholder="nombre@correo.com" error={erroresCampos.email} />
          <Campo
            id="contrasena"
            etiqueta="Contraseña"
            type="password"
            required
            minLength={esRegistro ? 8 : undefined}
            maxLength={72}
            autoComplete={esRegistro ? 'new-password' : 'current-password'}
            placeholder={esRegistro ? 'Mínimo 8 caracteres' : ''}
            error={erroresCampos.contrasena}
          />
          {esRegistro && <Campo id="telefono" etiqueta="Teléfono (opcional)" type="tel" maxLength={30} autoComplete="tel" error={erroresCampos.telefono} />}

          {error && Object.keys(erroresCampos).length === 0 && (
            <p className="alerta-error" role="alert">
              {error}
            </p>
          )}

          <button className={`boton ${estilos.enviar}`} type="submit" disabled={enviando}>
            {enviando ? 'Un momento…' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>
        <p className="chico">Con tu cuenta comprás, seguís tus pedidos y recibís avisos de stock.</p>
      </div>
    </main>
  )
}

export default Ingresar
