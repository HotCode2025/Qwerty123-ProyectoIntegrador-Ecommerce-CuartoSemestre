import { useCallback, useEffect, useMemo, useState } from 'react'
import { obtenerPerfil } from '../api/autenticacion'
import { CLAVE_TOKEN } from '../api/cliente'
import { ContextoAutenticacion } from './contextoAutenticacion'

const CLAVE_USUARIO = 'gp_usuario'

// El usuario se guarda junto al token para pintar el encabezado sin esperar a la API
function leerUsuarioGuardado() {
  try {
    return localStorage.getItem(CLAVE_TOKEN) ? JSON.parse(localStorage.getItem(CLAVE_USUARIO)) : null
  } catch {
    return null
  }
}

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado)

  /** Recibe la respuesta del ingreso o del registro: {token, usuario}. */
  const iniciarSesion = useCallback(({ token, usuario: usuarioIngresado }) => {
    localStorage.setItem(CLAVE_TOKEN, token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuarioIngresado))
    setUsuario(usuarioIngresado)
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setUsuario(null)
  }, [])

  // Al abrir el sitio se confirma que el token siga vigente (vence a las 24 horas)
  useEffect(() => {
    if (!localStorage.getItem(CLAVE_TOKEN)) {
      return
    }
    const controlador = new AbortController()
    obtenerPerfil(controlador.signal)
      .then((usuarioActualizado) => {
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuarioActualizado))
        setUsuario(usuarioActualizado)
      })
      .catch((error) => {
        if (error.estado === 401) {
          cerrarSesion()
        }
      })
    return () => controlador.abort()
  }, [cerrarSesion])

  const valor = useMemo(
    () => ({ usuario, estaLogueado: usuario !== null, esAdmin: usuario?.rol === 'ADMIN', iniciarSesion, cerrarSesion }),
    [usuario, iniciarSesion, cerrarSesion],
  )

  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>
}
