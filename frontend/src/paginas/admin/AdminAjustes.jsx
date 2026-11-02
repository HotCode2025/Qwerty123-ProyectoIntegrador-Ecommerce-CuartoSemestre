import { useState } from 'react'
import { guardarAjustes } from '../../api/admin'
import Icono from '../../componentes/Icono/Icono'
import { useAjustesTienda } from '../../contexto/contextoAjustes'
import compartidos from './admin.module.css'
import estilos from './AdminAjustes.module.css'

const CAMPOS = [
  { nombre: 'costoEnvio', etiqueta: 'Costo de envío', pista: 'Se cobra a cada pedido que no llega al envío gratis' },
  { nombre: 'envioGratisDesde', etiqueta: 'Envío gratis desde', pista: 'Productos + personalización. En 0, el envío siempre es gratis' },
  { nombre: 'recargoPersonalizacion', etiqueta: 'Recargo nombre y número', pista: 'Por cada camiseta personalizada' },
]

const formularioDe = (ajustes) => Object.fromEntries(CAMPOS.map(({ nombre }) => [nombre, String(Number(ajustes[nombre]))]))

/** Formulario con los valores cargados; se monta cuando ya llegaron los ajustes. */
function FormularioAjustes({ ajustes, alGuardar }) {
  const [formulario, setFormulario] = useState(() => formularioDe(ajustes))
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')
  const [erroresCampos, setErroresCampos] = useState({})

  const cambiar = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor })
    setGuardado(false)
    setErroresCampos({ ...erroresCampos, [campo]: undefined })
  }

  const alEnviar = (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    setErroresCampos({})
    const cuerpo = Object.fromEntries(CAMPOS.map(({ nombre }) => [nombre, formulario[nombre] === '' ? null : Number(formulario[nombre])]))
    guardarAjustes(cuerpo)
      .then((nuevos) => {
        alGuardar(nuevos)
        setFormulario(formularioDe(nuevos))
        setGuardado(true)
      })
      .catch((err) => {
        setError(err.message)
        setErroresCampos(err.errores ?? {})
      })
      .finally(() => setGuardando(false))
  }

  return (
    <form className={estilos.caja} onSubmit={alEnviar}>
      <h2 className={`display ${estilos.tituloCaja}`}>
        <Icono nombre="camion" /> Envío y personalización
      </h2>
      <div className={estilos.grilla}>
        {CAMPOS.map((campo) => (
          <div key={campo.nombre} className="campo">
            <label htmlFor={campo.nombre}>{campo.etiqueta}</label>
            <span className={estilos.dinero}>
              <span aria-hidden="true">$</span>
              <input
                id={campo.nombre}
                className="entrada"
                type="number"
                required
                min="0"
                step="1"
                value={formulario[campo.nombre]}
                onChange={(e) => cambiar(campo.nombre, e.target.value)}
                aria-invalid={erroresCampos[campo.nombre] ? true : undefined}
                aria-describedby={`${campo.nombre}-pista`}
              />
            </span>
            {erroresCampos[campo.nombre] ? (
              <p id={`${campo.nombre}-pista`} className="error-campo">
                {erroresCampos[campo.nombre]}
              </p>
            ) : (
              <p id={`${campo.nombre}-pista`} className={estilos.pista}>
                {campo.pista}
              </p>
            )}
          </div>
        ))}
      </div>

      {error && Object.keys(erroresCampos).length === 0 && (
        <p className="alerta-error" role="alert">
          {error}
        </p>
      )}

      <div className={estilos.acciones}>
        <button type="submit" className="boton" disabled={guardando}>
          <Icono nombre="guardar" /> {guardando ? 'Guardando…' : 'Guardar ajustes'}
        </button>
        {guardado && (
          <span className={estilos.listo} role="status">
            <Icono nombre="tilde" tamanio={16} /> Cambios guardados
          </span>
        )}
      </div>
      <p className={estilos.pista}>Rigen para las próximas compras. Los pedidos ya hechos mantienen los importes con que se pagaron.</p>
    </form>
  )
}

function AdminAjustes() {
  const { ajustes, cambiarAjustes } = useAjustesTienda()

  return (
    <div className={compartidos.pantalla}>
      <p className={compartidos.migas}>Panel / Ajustes</p>
      <div className={compartidos.cabecera}>
        <h1 className={`display ${compartidos.titulo}`}>Ajustes de la tienda</h1>
      </div>
      {ajustes ? (
        <FormularioAjustes ajustes={ajustes} alGuardar={cambiarAjustes} />
      ) : (
        <div className={compartidos.esqueleto} aria-busy="true" />
      )}
    </div>
  )
}

export default AdminAjustes
