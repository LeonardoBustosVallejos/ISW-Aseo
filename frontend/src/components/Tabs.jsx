import '../styles/tabs.css'
import React, { useState } from "react";

export function Tabs({ children }) {

    const [activa, setActiva] = useState(0);

    return (
        <>
            <div className="tabs-header">
                {children.map((tab, index) => (
                    <button
                        className={`${index === activa ? 'selected' : ''} ${tab.props.disabled ? 'disabled' : ''}`}
                        key={index}
                        onClick={() => setActiva(index)}
                        disabled={tab.props.disabled}
                    >
                        {tab.props.titulo}
                    </button>
                ))}
            </div>

            <div className="tabs-content">
                {children[activa]}
            </div>
        </>
    );
}

export function Tab({ children, titulo, disabled = false }) {
    return children;
}