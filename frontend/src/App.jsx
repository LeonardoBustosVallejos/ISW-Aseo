import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from '@pages/Login';
import Root from '@pages/Root';
import Error404 from '@pages/Error404';
import { AuthProvider } from "@context/AuthContext";
import ProtectedRoute from '@components/ProtectedRoute';
export default function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/dashboard" element={<Root />} />



                <Route path="*" element={<Error404 />} />
            </Routes>

        </Router>
    );
}