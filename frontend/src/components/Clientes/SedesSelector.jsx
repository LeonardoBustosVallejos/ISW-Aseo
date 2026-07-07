import { Table } from "../Tabla2";

export default function SedesSelector({
    sedes = [],
    selected = [],
    setSelected,
    noSelect = false,
    title = "Seleccionar sedes"
}) {

    return (
        <Table
            title={title}
            data={sedes}
            rowKey="sede_id"
            selectable={!noSelect}
            noExpand
            selection={selected}
            setSelection={setSelected}
            columns={[
                {
                    field: "nombre_sede",
                    header: "Nombre"
                },
                {
                    field: "direccion",
                    header: "Dirección"
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