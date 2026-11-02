import { createBrowserRouter, RouterProvider } from 'react-router'
import AvisoServidor from './componentes/AvisoServidor/AvisoServidor'
import Carrito from './paginas/Carrito/Carrito'
import Catalogo from './paginas/Catalogo/Catalogo'
import FinalizarCompra from './paginas/FinalizarCompra/FinalizarCompra'
import PaginaProducto from './paginas/DetalleProducto/DetalleProducto'
import Plantilla from './componentes/Plantilla/Plantilla'
import Inicio from './paginas/Inicio/Inicio'
import NoEncontrada from './paginas/NoEncontrada/NoEncontrada'
import Ingresar from './paginas/Ingresar/Ingresar'
import ResultadoPago from './paginas/ResultadoPago/ResultadoPago'


// Rutas del sitio (URLs en español). La tienda y el panel tienen cada uno su propia estructura
const enrutador = createBrowserRouter([
  {
    element: <Plantilla />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/carrito', element: <Carrito /> },
      { path: '/catalogo', element: <Catalogo /> },
      { path: '/finalizar-compra', element: <FinalizarCompra /> },
      { path: '/producto/:id', element: <PaginaProducto /> },
      { path: '*', element: <NoEncontrada /> },
      { path: '/ingresar', element: <Ingresar /> },
      // A esta URL vuelve Mercado Pago después de pagar (se configura en el backend)
      { path: '/pago/resultado', element: <ResultadoPago /> },
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