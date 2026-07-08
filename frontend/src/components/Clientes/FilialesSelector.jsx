import { Table } from "../Tabla2";


export default function FilialesSelector({
    filiales = [],
    selected = [],
    setSelected,
    title = "Seleccionar filiales"
}) {

    return (
        <Table
            title={title}
            data={filiales}
            rowKey="cliente_id"
            selectable
            noExpand
            selectedRows={selected}
            onSelectionChange={setSelected}
            columns={[
                {
                    field: "nombreCliente",
                    header: "Nombre"
                },
                {
                    field: "rutCliente",
                    header: "RUT"
                }
            ]}
        />
    );
}