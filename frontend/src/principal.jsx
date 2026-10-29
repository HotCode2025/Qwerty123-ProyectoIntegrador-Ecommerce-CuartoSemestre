// Los estilos globales van primero para que los CSS Modules de cada componente puedan pisarlos
import "./estilos/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Aplicacion from "./Aplicacion.jsx";
import { ProveedorAjustes } from "./contexto/ProveedorAjustes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorAjustes>
      <Aplicacion />
    </ProveedorAjustes>
  </StrictMode>,
);
