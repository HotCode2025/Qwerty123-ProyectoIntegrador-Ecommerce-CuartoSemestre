import { createBrowserRouter, RouterProvider } from "react-router";
import AvisoServidor from "./componentes/AvisoServidor/AvisoServidor";

// Rutas del sitio (URLs en español). La tienda y el panel tienen cada uno su propia estructura
const enrutador = createBrowserRouter([
  // Cada issue de pantalla agrega acá su ruta
]);

function Aplicacion() {
  return (
    <>
      <RouterProvider router={enrutador} />
      <AvisoServidor />
    </>
  );
}

export default Aplicacion;
