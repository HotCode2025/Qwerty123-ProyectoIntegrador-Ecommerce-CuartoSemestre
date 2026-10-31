// Los estilos globales van primero para que los CSS Modules de cada componente puedan pisarlos
import "./estilos/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Aplicacion from "./Aplicacion.jsx";
import { ProveedorAjustes } from "./contexto/ProveedorAjustes.jsx";
import { ProveedorAutenticacion } from "./contexto/ProveedorAutenticacion.jsx";
import { ProveedorCarrito } from "./contexto/ProveedorCarrito.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorAjustes>
      <ProveedorAutenticacion>
        <ProveedorCarrito>
          <Aplicacion />
        </ProveedorCarrito>
      </ProveedorAutenticacion>
    </ProveedorAjustes>
  </StrictMode>,
);