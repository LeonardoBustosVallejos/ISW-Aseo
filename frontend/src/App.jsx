import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from '@pages/Login';
import Root from '@pages/Root';
import Error404 from '@pages/Error404';
import { AuthProvider } from "@context/AuthContext";
import ProtectedRoute from '@components/ProtectedRoute';
import RegisterClienteForm from "@pages/registerCliente";
export default function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />

                <Route element={<Root />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/registrarCliente" element={<RegisterClienteForm />} />
                </Route>


                <Route path="*" element={<Error404 />} />
            </Routes>

        </Router>
    );
}