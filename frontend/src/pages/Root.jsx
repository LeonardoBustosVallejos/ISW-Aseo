import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import Sidebar from '../components/Sidebar';
import "../styles/root.css"
import { useState } from 'react';
import BackButton from '../components/misc/BackButton';
function Root() {
    return (
        <AuthProvider>
            <PageRoot />
        </AuthProvider>
    );
}

function PageRoot() {
    const [isOpen, setIsOpen] = useState(true)
    return (
        <div className='layout'>
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            <div className={`content ${isOpen ? 'open' : ''}`}>
                <BackButton />
                <Outlet />
            </div>
            <main />
        </div>

    );
}



export default Root;