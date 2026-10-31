import { createBrowserRouter, RouterProvider } from 'react-router'
import AvisoServidor from './componentes/AvisoServidor/AvisoServidor'
import Plantilla from './componentes/Plantilla/Plantilla'
import NoEncontrada from './paginas/NoEncontrada/NoEncontrada'

// Rutas del sitio (URLs en español). La tienda y el panel tienen cada uno su propia estructura
const enrutador = createBrowserRouter([
  {
    element: <Plantilla />,
    children: [
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])

function Aplicacion() {
  return (
    <>
      <RouterProvider router={enrutador} />
      <AvisoServidor />
    </>
  )
}

export default Aplicacion