import { Table } from "../Tabla2";

export default function SedesSelector({
    sedes = [],
    selected = [],
    setSelected,
    noSelect = false,
    title = "Seleccionar sedes"
}) {
    console.log(sedes);

    return (
        <Table
            title={title}
            data={sedes}
            rowKey="sede_id"
            selectable={!noSelect}
            noExpand
            selectedRows={selected}
            onSelectionChange={setSelected}
            columns={[
                {
                    field: "nombre_sede",
                    header: "Nombre",
                    render: (_, row) => row.nombre_sede
                },
                {
                    field: "nombreCliente",
                    header: "Propietario",
                    render: (_, row) => row.cliente.nombreCliente + '-' + row.cliente.tipoCliente
                },
                {
                    field: "direccion",
                    header: "Dirección",
                    render: (_, row) => row.direccion
                },
                {
                    field: "tipoSede",
                    header: "Tipo"
                },
                {
                    field: "personalSolicitado",
                    header: "Personal"
                }
            ]}
        />
    );
}