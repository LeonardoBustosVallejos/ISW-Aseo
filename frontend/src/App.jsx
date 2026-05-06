import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from '@pages/Login';
import Root from '@pages/Root';
import Error404 from '@pages/Error404';
import ProtectedRoute from '@components/ProtectedRoute';
import RegisterClienteForm from "@pages/registerCliente";


export default function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={<Root />}>

                    <Route path="cliente/registrar" element={<RegisterClienteForm />} />
                    {/*<Route path="inventario" element={<Inventario />} />
                    <Route path="recursos/resumen" element={<Resumen />} />
                    <Route path="recursos/detalles" element={<Detalles />} />
                    <Route path="trabajadores/eliminar" element={<EliminarTrabajador />} />*/}
                </Route>


                <Route path="*" element={<Error404 />} />
            </Routes>

        </Router>
    );
}