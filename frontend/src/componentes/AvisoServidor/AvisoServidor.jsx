import { useEffect, useState } from "react";
import { alHaberPeticionesLentas } from "../../api/cliente";
import estilos from "./AvisoServidor.module.css";

/**
 * Cartel abajo de la pantalla mientras alguna petición a la API tarda más de lo normal
 * (pasa cuando el servidor gratuito de Render se está despertando).
 */
function AvisoServidor() {
  const [visible, setVisible] = useState(false);

  useEffect(() => alHaberPeticionesLentas(setVisible), []);

  if (!visible) {
    return null;
  }

  return (
    <div className={estilos.aviso} role="status" aria-live="polite">
      <span className={estilos.pelota} aria-hidden="true" />
      <span>
        <strong>Estamos despertando el servidor…</strong>
        <span className={estilos.chico}>
          La primera visita puede tardar hasta un minuto.
        </span>
      </span>
    </div>
  );
}

export default AvisoServidor;
