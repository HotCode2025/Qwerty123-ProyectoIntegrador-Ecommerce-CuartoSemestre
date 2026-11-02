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
import DetallePedido from './paginas/DetallePedido/DetallePedido'
import MisPedidos from './paginas/MisPedidos/MisPedidos'
import PlantillaAdmin from './componentes/PlantillaAdmin/PlantillaAdmin'
import AdminNoEncontrada from './paginas/admin/AdminNoEncontrada'
import AdminDetallePedido from './paginas/admin/AdminDetallePedido'
import AdminPedidos from './paginas/admin/AdminPedidos'


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
      { path: '/mis-pedidos', element: <MisPedidos /> },
      { path: '/mis-pedidos/:id', element: <DetallePedido /> },
    ],
  },
  {
    // Panel de administración: PlantillaAdmin deja entrar solo a administradores
    path: '/admin',
    element: <PlantillaAdmin />,
    children: [
      { path: '*', element: <AdminNoEncontrada /> },
      { index: true, element: <AdminPedidos /> },
      { path: 'pedidos/:id', element: <AdminDetallePedido /> },
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