import React from 'react';

export default function ListaCompania({ index, compania, rut, ubicacion, onClick, children }) {
    return (
        <div 
            className="tabla-cliente fila-recurso" 
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <div>{index ? index : "-"}</div>

            <div>
                <div>
                    <strong>{compania || "CompWañía sin nombre"}</strong>
                </div>
                <div>
                    {rut || "Sin RUT"}
                </div>
            </div>

            <div>
                <div><strong>Ubicación</strong></div>
                <p>{ubicacion || "Ubicación no registrada"}</p>
            </div>
            {children && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
}