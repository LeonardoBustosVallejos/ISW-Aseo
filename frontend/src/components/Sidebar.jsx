import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css"
import { logout } from "../services/auth.service.js";
import { BookUser, CircleChevronDown, FileUser, House, Info, LogOut, Network, NotebookPen, PanelLeftClose, PanelLeftOpen, ShelvingUnit, TableProperties, Trash2, UserRound, UserRoundCheck, UserRoundPlus, UsersRound, Warehouse, Users } from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const comprobarTamañoPantalla = () => {
            if (window.innerWidth <= 450) {
                setIsOpen(false);
            }
        };
        comprobarTamañoPantalla();
        window.addEventListener("resize", comprobarTamañoPantalla);
        return () => window.removeEventListener("resize", comprobarTamañoPantalla);
    }, []);

    let rolUsuario = null;
    let rolIdUsuario = null;
    try {
        const usuarioGuardado = sessionStorage.getItem("usuario");
        if (usuarioGuardado && usuarioGuardado !== "undefined") {
            const usuarioLogueado = JSON.parse(usuarioGuardado);
            const rolRaw = usuarioLogueado?.rol;
            rolUsuario = typeof rolRaw === "string"
                ? rolRaw
                : rolRaw?.nombre || rolRaw?.rol || rolRaw?.nombreRol || rolRaw?.role || usuarioLogueado?.rolNombre || usuarioLogueado?.nombreRol || "";
            rolIdUsuario = Number(
                rolRaw?.id ?? rolRaw?.rol_id ?? rolRaw?.role_id ?? usuarioLogueado?.rol_id ?? usuarioLogueado?.role_id ?? usuarioLogueado?.rol?.id ?? 0
            );
        }
    } catch (error) {
        console.error("Error al intentar leer el perfil del usuario:", error);
    }

    const rolNormalizado = String(rolUsuario || "").trim().toLowerCase();
    const esRolAutorizado = rolNormalizado === "administrador" || rolNormalizado === "supervisor" || rolIdUsuario === 1 || rolIdUsuario === 3;

    const menuData = [
        ...(esRolAutorizado ? [
            {
                symbol: <Warehouse />,
                title: "Bodega",
                path: "/bodega",
            },
            {
                symbol: <NotebookPen />,
                title: "Solicitudes",
                path: "/solicitudes",
            },
        ] : []),
        {
            symbol: <BookUser />,
            title: "Trabajadores",
            children: [
                { symbol: <UserRoundPlus />, title: "Ingresar Trabajador", path: "/trabajadores/ingresar" },
                { symbol: <UserRoundCheck />, title: "Editar Trabajadores", path: "/trabajadores/asignar" },
                { symbol: <Users />, title: "Editar Grupos", path: "/trabajadores/eliminar" },
            ],
        },
        {
            symbol: <Network />,
            title: "Clientes",
            children: [
                { symbol: <UsersRound />, title: "Lista de Clientes", path: "/clientes" },
                { symbol: <UserRoundPlus />, title: "Agregar", path: "/clientes/registrar" },
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
            <div className={`sidebar-top `}>

                <button type="button" className={`top-button`} onClick={() => navigate('/home')}>
                    <House />
                </button>
                <button type="button" className={`top-button`} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ?
                        <PanelLeftClose />
                        :
                        <PanelLeftOpen />
                    }
                </button>
            </div>
            <div className={`sidebar-header `}>

                <div className={`${isOpen ? '' : 'oculto'}`}>
                    Sidebar
                </div>
            </div>
            <div className={`menudata `}>
                {menuData.map((item, index) => (
                    <div key={index}>
                        {item.children ? (
                            <>
                                <div
                                    className="menu-item"
                                    onClick={() => toggleMenu(index)}
                                >
                                    <div style={{ display: 'flex' }}>

                                        <span>

                                            {item.symbol}
                                        </span>
                                        <span className={`${isOpen ? '' : 'oculto'}`}>
                                            {item.title}</span>
                                    </div>
                                    <span className={`arrow accordion-icon ${openMenu === index ? "open" : ""}`}>
                                        <CircleChevronDown />
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
                                            {child.symbol && <span>{child.symbol}</span>}
                                            <span className={`${isOpen ? '' : 'oculto'}`}>
                                                {child.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Link
                                to={item.path}
                                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                            >
                                <div className="label-item">

                                    <div>{item.symbol}</div>
                                    <div className={`${isOpen ? '' : 'oculto'}`}>{item.title}</div>
                                </div>
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