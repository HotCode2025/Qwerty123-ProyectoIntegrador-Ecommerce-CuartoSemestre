import { llamarApi } from './cliente'

/** Inicia sesión. Devuelve {token, usuario}. */
export function ingresar(credenciales) {
  return llamarApi('/autenticacion/ingreso', { metodo: 'POST', cuerpo: credenciales })
}

/** Crea una cuenta de cliente. Devuelve {token, usuario}. */
export function registrar(datos) {
  return llamarApi('/autenticacion/registro', { metodo: 'POST', cuerpo: datos })
}

/** Datos del usuario dueño del token guardado. */
export function obtenerPerfil(senal) {
  return llamarApi('/autenticacion/perfil', { senal })
}
