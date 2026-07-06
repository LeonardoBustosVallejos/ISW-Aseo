import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronDownCircle, ChevronLeft, ChevronRight, ChevronRightCircle } from "lucide-react";
import { Fragment, useState } from "react";
import '../styles/tabla2.css'
import Header from "./misc/Header";
import { formatDate, formatDateTime } from "../helpers/formatDate";

/**
 * 
 * @param {*} title Título de la tabla
 * @param {*} columns Columnas, debe ir [{field, header}]
 * @param {*} param0 
 * @returns 
 */
export function Table({ emptyMessage, rowKey, title, columns, data, renderExpanded, actions, noExpand = false, selectable = false, selectedRows = [], onSelectionChange }) {
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({});
    const [sortField, setSortField] = useState(null)

    const [sortDirection, setSortDirection] =
        useState("asc");


    function esFecha(valor) {
        if (valor instanceof Date) {
            return !isNaN(valor.getTime());
        }

        if (typeof valor === "string") {
            return !isNaN(Date.parse(valor));
        }

        return false;
    }

    function handleSort(field) {

        if (sortField === field) {

            setSortDirection(prev =>
                prev === "asc"
                    ? "desc"
                    : "asc"
            );

        } else {

            setSortField(field);

            setSortDirection("asc");

        }

    }
    const isRowSelected = (row) => {
        return selectedRows.some(selected => selected[rowKey] === row[rowKey]);
    };

    const handleSelectRow = (row) => {
        if (!onSelectionChange) return;

        const alreadySelected = isRowSelected(row);
        let newSelection;

        if (alreadySelected) {
            newSelection = selectedRows.filter(selected => selected[rowKey] !== row[rowKey]);
        } else {
            newSelection = [...selectedRows, row];
        }

        onSelectionChange(newSelection);
    };

    const handleSelectAllPage = (pageData) => {
        if (!onSelectionChange) return;

        const allPageSelected = pageData.every(row => isRowSelected(row));
        let newSelection;

        if (allPageSelected) {
            const pageKeys = pageData.map(row => row[rowKey]);
            newSelection = selectedRows.filter(selected => !pageKeys.includes(selected[rowKey]));
        } else {
            const missingRows = pageData.filter(row => !isRowSelected(row));
            newSelection = [...selectedRows, ...missingRows];
        }

        onSelectionChange(newSelection);
    };
    const filteredData = data.filter(row => {

        const matchesSearch = columns.some(col =>
            String(row[col.field] ?? "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        if (!matchesSearch)
            return false;

        return columns.every(col => {

            const filter = filters[col.field] || "";

            if (!filter)
                return true;

            return String(row[col.field] ?? "")
                .toLowerCase()
                .includes(filter.toLowerCase());

        });

    });
    const sortedData = [...filteredData].sort((a, b) => {

        if (!sortField)
            return 0;

        const first = a[sortField];
        const second = b[sortField];

        if (first == null) return 1;
        if (second == null) return -1;

        if (typeof first === "number") {
            return sortDirection === "asc"
                ? first - second
                : second - first;
        }

        return sortDirection === "asc"
            ? String(first).localeCompare(String(second))
            : String(second).localeCompare(String(first));

    });
    const totalPages =
        Math.ceil(
            filteredData.length /
            rowsPerPage
        );
    const paginatedData =
        sortedData.slice(
            (page - 1) * rowsPerPage,
            page * rowsPerPage
        );

    const isAllPageSelected = paginatedData.length > 0 && paginatedData.every(row => isRowSelected(row));


    return (
        <div className="table-card">
            <Header title={title}>

                <input
                    className="table-search"
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Header>

            <div className="table-wrapper">

                <table >
                    <thead>

                        <tr className="table-head">
                            {selectable && (
                                <th style={{ width: '40px', textAlignment: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAllPageSelected}
                                        onChange={() => handleSelectAllPage(paginatedData)}
                                    />
                                </th>
                            )}
                            <th></th>
                            {columns.map((col) => (
                                <th
                                    key={col.field} onClick={() =>
                                        handleSort(col.field)
                                    }>
                                    <div className="table-sort">

                                        {col.header}

                                        {
                                            sortField !== col.field
                                                ? <ArrowUpDown size={14} />
                                                : sortDirection === "asc"
                                                    ? <ArrowUp size={14} />
                                                    : <ArrowDown size={14} />
                                        }

                                    </div>
                                </th>
                            ))}
                            {actions ?
                                <th>Acciones</th> : ''
                            }
                        </tr>
                    </thead>
                    <tbody>

                        {paginatedData.length === 0 ? (

                            <tr>

                                <td
                                    className="table-empty"
                                    colSpan={
                                        columns.length +
                                        1 +
                                        (actions ? 1 : 0)
                                    }
                                >

                                    {emptyMessage || 'No existen registros.'}

                                </td>

                            </tr>

                        ) :


                            (paginatedData.map(row => (

                                <Fragment key={row[rowKey]}>
                                    <tr>
                                        {selectable && (
                                            <td style={{ textAlignment: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isRowSelected(row)}
                                                    onChange={() => handleSelectRow(row)}
                                                />
                                            </td>
                                        )}
                                        <td>
                                            <ChevronRightCircle
                                                className={
                                                    `${expanded === row[rowKey]
                                                        ? "table-arrow open"
                                                        : "table-arrow"} ${noExpand && 'oculto'}`
                                                }
                                                onClick={() =>
                                                    setExpanded(
                                                        expanded === row[rowKey] && !noExpand
                                                            ? null
                                                            : row[rowKey]
                                                    )
                                                }
                                            />

                                        </td>

                                        {columns.map(col => (

                                            <td key={col.field}>
                                                {col.render
                                                    ? col.render(row[col.field], row)
                                                    :

                                                    esFecha(row[col.field]) ? formatDateTime(row[col.field])
                                                        : row[col.field]
                                                }
                                            </td>

                                        ))}
                                        {actions && (

                                            <td>

                                                {actions?.(row)}

                                            </td>
                                        )}
                                    </tr>

                                    {expanded === row[rowKey] && (

                                        <tr className="expanded-row">

                                            <td className="expanded-cell"
                                                colSpan={
                                                    columns.length +
                                                    1 +
                                                    (actions ? 1 : 0)
                                                }>

                                                <div className="expanded-content">

                                                    {renderExpanded?.(row)}

                                                </div>
                                            </td>

                                        </tr>

                                    )}

                                </Fragment>

                            )))

                        }

                    </tbody>


                </table>
            </div>
            <div className="table-footer">
                <div className="pagination">

                    <button
                        className="nav-page"
                        disabled={page === 1}
                        onClick={() =>
                            setPage(page - 1)
                        }
                    >
                        <ChevronLeft />
                        Anterior
                    </button>

                    <span>
                        Página {page} de {totalPages}
                    </span>

                    <button
                        className="nav-page"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage(page + 1)
                        }
                    >
                        Siguiente
                        <ChevronRight />
                    </button>
                </div>

                <select className="pages"
                    value={rowsPerPage}
                    onChange={(e) => {

                        setRowsPerPage(
                            Number(e.target.value)
                        );

                        setPage(1);

                    }}
                >

                    <option value={1}>1</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>

                </select>
            </div>
        </div>
    )
}