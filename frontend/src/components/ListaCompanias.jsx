import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/listaCompania.css';

export default function ListaCompania({ 
    data = [], 
    emptyMessage = "No se encontraron registros.", 
    onRowClick, 
    renderExtraContent 
}) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    useEffect(() => {
        setPage(1);
    }, [data.length]);

    //Cálculos paginacion
    const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
    const currentPage = page > totalPages ? totalPages : page;
    const paginatedData = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div className="lista-compania-container">
            <div className="tabla-clientes">
                
                {paginatedData.length === 0 ? (
                    <div className="tabla-cliente empty-message">
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    paginatedData.map((fila, index) => {
                        const indiceGlobal = (currentPage - 1) * rowsPerPage + index + 1;

                        return (
                            <div 
                                key={`${fila.id || indiceGlobal}-${index}`}
                                className={`tabla-cliente fila-recurso ${onRowClick ? 'clickable' : ''}`}
                                onClick={() => onRowClick && onRowClick(fila)}
                            >
                                <div className="indice-recurso">
                                    {indiceGlobal}
                                </div>

                                <div>
                                    <strong>{fila.compania || "Compañía sin nombre"}</strong>
                                    <p className="rut-text">{fila.id || "Sin RUT"}</p>
                                </div>

                                <div>
                                    <strong>Ubicación</strong>
                                    <p>{fila.ubicacion || "Ubicación no registrada"}</p>
                                </div>

                                {renderExtraContent && (
                                    <div>
                                        {renderExtraContent(fila)}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/*Controles paginacion*/}
            {data.length > 0 && (
                <div className="table-footer">
                    <div className="pagination">
                        <button
                            className="nav-page"
                            disabled={currentPage === 1}
                            onClick={() => setPage(currentPage - 1)}
                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </button>

                        <span>
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            className="nav-page"
                            disabled={currentPage === totalPages}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            Siguiente
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <select 
                        className="pages"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value={1}>1 por pág.</option>
                        <option value={5}>5 por pág.</option>
                        <option value={10}>10 por pág.</option>
                        <option value={20}>20 por pág.</option>
                    </select>
                </div>
            )}
        </div>
    );
}