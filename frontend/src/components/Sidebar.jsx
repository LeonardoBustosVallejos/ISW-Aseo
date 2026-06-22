import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css"
import { logout } from "../services/auth.service.js";
import { LogOut, PanelLeftClose, PanelLeftOpen, UserRound } from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const location = useLocation();

    let rolUsuario = null;
    try {
        const usuarioGuardado = sessionStorage.getItem("usuario");
        console.log("¡Por fin encontramos el rol! Es:", usuarioGuardado);
        if (usuarioGuardado && usuarioGuardado !== "undefined") {
            const usuarioLogueado = JSON.parse(usuarioGuardado);
            rolUsuario = usuarioLogueado.rol.id;
        }
        console.log("¡Por fin encontramos el rol! Es:", rolUsuario);

    } catch (error) {
        console.error("Error al intentar leer el perfil del usuario:", error);
    }
    const menuData = [
        {
            title: "Bodega",
            path: "/bodega",
        },
        {
            title: "Solicitudes",
            path: "/solicitudes",
        },
        {
            title: "Recursos",
            children: [
                ...(rolUsuario == 1 ? [{ title: "Resumen", path: "/recursos/resumen" }] : []),
                { title: "Detalles", path: "/recursos/detalles" },
            ],
        },
        {
            title: "Trabajadores",
            children: [
                { title: "Ingresar Trabajador", path: "/trabajadores/ingresar" },
                { title: "Asignar Trabajador", path: "/trabajadores/asignar" },
                { title: "Eliminar Trabajador", path: "/trabajadores/eliminar" },
            ],
        },
        {
            title: "Clientes",
            children: [
                { title: "Lista de Clientes", path: "/clientes" },
                { title: "Agregar", path: "/clientes/registrar" },
            ],

        },
    ];

    const toggleMenu = (index) => {
        setOpenMenu(openMenu === index ? null : index);
    };

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-top" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ?
                    <PanelLeftClose />
                    :
                    <PanelLeftOpen />
                }
            </div>
            <div className={`sidebar-header ${isOpen ? '' : 'oculto'}`}>
                Sidebar
            </div>
            <div className={`menudata ${isOpen ? '' : 'oculto'}`}>
                {menuData.map((item, index) => (
                    <div key={index}>
                        {item.children ? (
                            <>
                                <div
                                    className="menu-item"
                                    onClick={() => toggleMenu(index)}
                                >
                                    <span>{item.title}</span>
                                    <span className={`arrow accordion-icon ${openMenu === index ? "open" : ""}`}>
                                        ▼
                                    </span>
                                </div>

                                {/* 👇 SIEMPRE renderizado */}
                                <div className={`submenu ${openMenu === index ? "open" : ""}`}>
                                    {item.children.map((child, i) => (
                                        <Link
                                            key={i}
                                            to={child.path}
                                            className={`submenu-item ${location.pathname === child.path ? "active" : ""}`}
                                        >
                                            {child.title}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Link
                                to={item.path}
                                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                            >
                                {item.title}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            <div className="bottom">
                {/*
                <div className="profile">
                    {isOpen ?
                        'Perfil'
                        :
                        < UserRound />}
                </div>
                    */}

                <div className="logout" onClick={logoutSubmit}>
                    {isOpen ?
                        'Cerrar Sesión'
                        :
                        <LogOut />}

                </div>
            </div>
        </div>
    )
}


export default Sidebar