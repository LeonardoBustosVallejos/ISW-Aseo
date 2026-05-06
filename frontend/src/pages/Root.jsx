import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import Sidebar from '../components/Sidebar';
import "../styles/root.css"
function Root() {
    return (
        <AuthProvider>
            <PageRoot />
        </AuthProvider>
    );
}

function PageRoot() {
    return (
        <div className='layout'>
            <Sidebar />
            <div className='content'>
                <Outlet />
            </div>
            <main />
        </div>

    );
}



export default Root;