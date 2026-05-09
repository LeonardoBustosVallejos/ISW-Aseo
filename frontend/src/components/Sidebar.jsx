import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css"
import { logout } from "../services/auth.service.js";

/**
 * Contiene los campos del menu lateral
 */
const menuData = [
    {
        title: "Inventario",
        path: "/inventario",
    },
    {
        title: "Recursos",
        children: [
            { title: "Resumen", path: "/recursos/resumen" },
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
            { title: "Agregar", path: "/cliente/registrar" },
        ],

    },
];


const Sidebar = () => {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const location = useLocation();

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
        <div className="sidebar">
            <div></div>
            <div style={{ textAlign: "center" }}>
                escudo ubb
            </div>
            <div style={{ textAlign: "center" }}>
                logo ubb
            </div>
            <div>
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
            <div>
                <div className="profile">Perfil</div>

                <div className="logout" onClick={logoutSubmit}>Cerrar Sesión</div>
            </div>
        </div>
    )
}


export default Sidebar