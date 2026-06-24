import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from '@pages/Login';
import Root from '@pages/Root';
import Error404 from '@pages/Error404';
//import ProtectedRoute from '@components/ProtectedRoute';
import RegisterClienteForm from "@pages/Clientes/registerCliente";
import Bodega from '@pages/Bodega';
import ResumenRecursos from "@pages/Recursos/resumen.jsx";
import IngresarTrabajador from "@pages/trabajadores/ingresarTrabajador";
import AsignarTrabajador from "@pages/trabajadores/AsignarTrabajador";
import ListaClientes from "@pages/Clientes/ListaClientes";
import InfoCliente from "./pages/Clientes/InfoCliente";


export default function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={<Root />}>
                    <Route path="home" element={<Root />} />
                    <Route path="recursos/resumen" element={<ResumenRecursos />} />
                    {/*<Route path="recursos/detalles" element={<Detalles />} />
                <Route path="trabajadores/eliminar" element={<EliminarTrabajador />} />*/}
                    <Route path="bodega" element={<Bodega />} />

                    <Route path="trabajadores/ingresar" element={<IngresarTrabajador />} />
                    <Route path="trabajadores/asignar" element={<AsignarTrabajador />} />



                    <Route path="clientes"  >
                        <Route path="" element={<ListaClientes />} />
                        <Route path="registrar" element={<RegisterClienteForm />} />

                    </Route>
                    <Route path={`cliente/rut/:rutCliente/id/:cliente_id`} element={<InfoCliente />}>

                    </Route>



                    <Route path="*" element={<Error404 />} />
                </Route>


                <Route path="*" element={<Error404 />} />
            </Routes>

        </Router>
    );
}