// Cliente único para hablar con la API: arma la URL, agrega el token y traduce los errores
const URL_API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

// Clave del token en localStorage (la usa también ProveedorAutenticacion)
export const CLAVE_TOKEN = "gp_sesion";

/** Error con el formato que devuelve el backend: {estado, mensaje, errores}. */
export class ErrorApi extends Error {
  constructor(estado, mensaje, errores = null) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado; // 0 si no se pudo conectar
    this.errores = errores; // errores por campo, solo en validaciones
  }
}

/** Convierte {deporte: 'FUTBOL', pagina: 0} en "?deporte=FUTBOL&pagina=0", sin los valores vacíos. */
export function aConsulta(parametros = {}) {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      consulta.append(clave, valor);
    }
  });
  const texto = consulta.toString();
  return texto ? `?${texto}` : "";
}

// ---------- Aviso de servidor lento ----------
// En el plan gratis de Render el backend se duerme sin uso y la primera petición tarda ~50 s.
// Si alguna petición tarda más de LENTA_DESPUES_DE_MS, se avisa a quien escuche (AvisoServidor)
const LENTA_DESPUES_DE_MS = 4000;
let peticionesLentas = 0;
const oyentesLentitud = new Set();

const avisarLentitud = () =>
  oyentesLentitud.forEach((oyente) => oyente(peticionesLentas > 0));

/** Suscribe a los cambios de "hay peticiones lentas". Devuelve la función para desuscribirse. */
export function alHaberPeticionesLentas(oyente) {
  oyentesLentitud.add(oyente);
  return () => oyentesLentitud.delete(oyente);
}

export async function llamarApi(ruta, opciones = {}) {
  let lenta = false;
  const temporizador = setTimeout(() => {
    lenta = true;
    peticionesLentas++;
    avisarLentitud();
  }, LENTA_DESPUES_DE_MS);
  try {
    return await peticion(ruta, opciones);
  } finally {
    clearTimeout(temporizador);
    if (lenta) {
      peticionesLentas--;
      avisarLentitud();
    }
  }
}

async function peticion(ruta, { metodo = "GET", cuerpo, senal } = {}) {
  const encabezados = {};
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) {
    encabezados.Authorization = `Bearer ${token}`;
  }
  // Las fotos viajan como FormData y el navegador arma solo el Content-Type
  const esFormulario = cuerpo instanceof FormData;
  if (cuerpo !== undefined && !esFormulario) {
    encabezados["Content-Type"] = "application/json";
  }

  let respuesta;
  try {
    respuesta = await fetch(URL_API + ruta, {
      method: metodo,
      headers: encabezados,
      body:
        cuerpo === undefined || esFormulario ? cuerpo : JSON.stringify(cuerpo),
      signal: senal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new ErrorApi(
      0,
      "No pudimos conectar con el servidor. Probá de nuevo en unos minutos.",
    );
  }

  if (respuesta.status === 204) {
    return null;
  }
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      datos?.mensaje ?? "Ocurrió un error inesperado.",
      datos?.errores ?? null,
    );
  }
  return datos;
}
