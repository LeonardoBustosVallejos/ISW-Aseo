import { Outlet } from 'react-router-dom';
import Navbar from '@components/Navbar';
import { AuthProvider } from '@context/AuthContext';
import RegisterClienteForm from './registerCliente';

function Root() {
    return (
        <AuthProvider>
            <PageRoot />
            <RegisterClienteForm />
        </AuthProvider>
    );
}

function PageRoot() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}

export default Root;