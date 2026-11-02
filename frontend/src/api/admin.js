import { aConsulta, llamarApi } from './cliente'

// Llamadas del panel de administración (el backend exige rol ADMIN en todas)

/** Pedidos de todos los clientes. estado: un EstadoPedido o vacío para todos. */
export function obtenerPedidosAdmin({ estado, pagina = 0, tamanioPagina = 20 } = {}, senal) {
  return llamarApi(`/admin/pedidos${aConsulta({ estado, pagina, tamanioPagina })}`, { senal })
}

/** Avanza el estado (PAGADO → EN_PREPARACION → ENVIADO → ENTREGADO) o cancela uno pendiente de pago. */
export function cambiarEstadoPedido(id, estado) {
  return llamarApi(`/admin/pedidos/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado } })
}

/** Usuarios, con búsqueda opcional por nombre, apellido o email. */
export function obtenerUsuariosAdmin({ busqueda, pagina = 0, tamanioPagina = 20 } = {}, senal) {
  return llamarApi(`/admin/usuarios${aConsulta({ busqueda, pagina, tamanioPagina })}`, { senal })
}

export function cambiarHabilitadoUsuario(id, habilitado) {
  return llamarApi(`/admin/usuarios/${id}/habilitado`, { metodo: 'PATCH', cuerpo: { habilitado } })
}

// ---------- Productos ----------

/** Productos del panel (incluye los dados de baja). habilitado: true, false o vacío para todos. */
export function obtenerProductosAdmin({ busqueda, habilitado, pagina = 0, tamanioPagina = 20 } = {}, senal) {
  return llamarApi(`/admin/productos${aConsulta({ busqueda, habilitado, pagina, tamanioPagina })}`, { senal })
}

export function obtenerProductoAdmin(id, senal) {
  return llamarApi(`/admin/productos/${id}`, { senal })
}

/** producto: {nombre, descripcion, precio, deporte, categoriaId, marcaId, personalizable, destacado, habilitado} */
export function guardarProducto(id, producto) {
  return id
    ? llamarApi(`/admin/productos/${id}`, { metodo: 'PUT', cuerpo: producto })
    : llamarApi('/admin/productos', { metodo: 'POST', cuerpo: producto })
}

/** Elimina un producto que nunca se vendió. Si ya está en pedidos responde 409 (hay que darlo de baja). */
export function eliminarProducto(id) {
  return llamarApi(`/admin/productos/${id}`, { metodo: 'DELETE' })
}

/** items: [{talleId, cantidad}]. Los talles que no vienen no se modifican. */
export function actualizarStock(id, items) {
  return llamarApi(`/admin/productos/${id}/stock`, { metodo: 'PUT', cuerpo: { items } })
}

export function subirImagenProducto(id, archivo) {
  const formulario = new FormData()
  formulario.append('archivo', archivo)
  return llamarApi(`/admin/productos/${id}/imagen`, { metodo: 'POST', cuerpo: formulario })
}

// ---------- Marcas y categorías ----------
// tipo: 'marcas' o 'categorias' (mismas rutas y respuestas en las dos)

export function obtenerItemsCatalogo(tipo, senal) {
  return llamarApi(`/admin/${tipo}`, { senal })
}

export function guardarItemCatalogo(tipo, id, datos) {
  return id
    ? llamarApi(`/admin/${tipo}/${id}`, { metodo: 'PUT', cuerpo: datos })
    : llamarApi(`/admin/${tipo}`, { metodo: 'POST', cuerpo: datos })
}

export function borrarItemCatalogo(tipo, id) {
  return llamarApi(`/admin/${tipo}/${id}`, { metodo: 'DELETE' })
}

// ---------- Ajustes de la tienda ----------

/** ajustes: {costoEnvio, envioGratisDesde, recargoPersonalizacion}. Rigen para las próximas compras. */
export function guardarAjustes(ajustes) {
  return llamarApi('/admin/ajustes', { metodo: 'PUT', cuerpo: ajustes })
}
