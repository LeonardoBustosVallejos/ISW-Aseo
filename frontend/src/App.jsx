import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from '@pages/Login';
import Root from '@pages/Root';
import Error404 from '@pages/Error404';
//import ProtectedRoute from '@components/ProtectedRoute';
import RegisterClienteForm from "@pages/Clientes/registerCliente";
import Bodega from '@pages/Bodega';
import Solicitudes from '@pages/Solicitudes';
import IngresarTrabajador from "@pages/trabajadores/ingresarTrabajador";
import AsignarTrabajador from "@pages/trabajadores/AsignarTrabajador";


export default function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={<Root />}>
                <Route path="home" element={<Root />} />
                {/*<Route path="recursos/resumen" element={<Resumen />} />
                <Route path="recursos/detalles" element={<Detalles />} />
                <Route path="trabajadores/eliminar" element={<EliminarTrabajador />} />*/}
                <Route path="bodega" element={<Bodega />} />
                <Route path="solicitudes" element={<Solicitudes />} />
                <Route path="cliente"  >
                <Route path="registrar" element={<RegisterClienteForm />} />
                
            </Route>
            <Route path="trabajadores/ingresar" element={<IngresarTrabajador />} />
            <Route path="trabajadores/asignar" element={<AsignarTrabajador />} />
            </Route>


            <Route path="*" element={<Error404 />} />
            </Routes>

        </Router>
    );
}