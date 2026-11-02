import { useState } from 'react'
import { eliminarProducto, guardarProducto } from '../../api/admin'
import DialogoConfirmacion from '../../componentes/DialogoConfirmacion/DialogoConfirmacion'

// Datos que pide el backend para guardar el producto (para darlo de baja sin perder nada)
const cuerpoDe = (producto, cambios) => ({
  nombre: producto.nombre,
  descripcion: producto.descripcion,
  precio: producto.precio,
  precioOferta: producto.precioOferta,
  deporte: producto.deporte,
  categoriaId: producto.categoriaId,
  marcaId: producto.marcaId,
  personalizable: producto.personalizable,
  destacado: producto.destacado,
  habilitado: producto.habilitado,
  ...cambios,
})

/**
 * Confirmación para eliminar un producto. Si ya se vendió, el backend no deja borrarlo (409)
 * y el cartel ofrece darlo de baja en su lugar.
 */
function DialogoEliminarProducto({ producto, alCerrar, alEliminar, alDarDeBaja }) {
  const [ocupado, setOcupado] = useState(false)
  const [vendido, setVendido] = useState(false) // el backend respondió que está en pedidos
  const [error, setError] = useState('')

  const eliminar = () => {
    setOcupado(true)
    setError('')
    eliminarProducto(producto.id)
      .then(() => alEliminar(producto))
      .catch((err) => {
        if (err.estado === 409) {
          setVendido(true)
        } else {
          setError(err.message)
        }
        setOcupado(false)
      })
  }

  const darDeBaja = () => {
    setOcupado(true)
    setError('')
    guardarProducto(producto.id, cuerpoDe(producto, { habilitado: false }))
      .then(alDarDeBaja)
      .catch((err) => {
        setError(err.message)
        setOcupado(false)
      })
  }

  if (vendido) {
    return (
      <DialogoConfirmacion
        tono="advertencia"
        titulo="No se puede eliminar"
        alCerrar={alCerrar}
        acciones={
          <>
            {producto.habilitado && (
              <button type="button" className="boton" onClick={darDeBaja} disabled={ocupado}>
                {ocupado ? 'Guardando…' : 'Dar de baja'}
              </button>
            )}
            <button type="button" className="boton boton-blanco" onClick={alCerrar} disabled={ocupado}>
              {producto.habilitado ? 'Cancelar' : 'Entendido'}
            </button>
          </>
        }
      >
        <p>
          <strong>{producto.nombre}</strong> ya está en pedidos de clientes, y esos pedidos lo necesitan para mostrar el detalle.
        </p>
        <p>
          {producto.habilitado
            ? 'Podés darlo de baja: deja de verse en la tienda, pero los pedidos quedan intactos.'
            : 'Ya está dado de baja, así que no se ve en la tienda.'}
        </p>
        {error && <p className="error-campo">{error}</p>}
      </DialogoConfirmacion>
    )
  }

  return (
    <DialogoConfirmacion
      titulo="¿Eliminar producto?"
      alCerrar={alCerrar}
      acciones={
        <>
          <button type="button" className="boton" style={{ background: 'var(--error)' }} onClick={eliminar} disabled={ocupado}>
            {ocupado ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button type="button" className="boton boton-blanco" onClick={alCerrar} disabled={ocupado}>
            Cancelar
          </button>
        </>
      }
    >
      <p>
        Vas a eliminar <strong>{producto.nombre}</strong> con su stock y su foto.
      </p>
      <p>No se puede deshacer.</p>
      {error && <p className="error-campo">{error}</p>}
    </DialogoConfirmacion>
  )
}

export default DialogoEliminarProducto
