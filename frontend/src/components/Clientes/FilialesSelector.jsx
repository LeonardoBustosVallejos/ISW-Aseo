import { Table } from "../Tabla2";
import SedesSelector from "./SedesSelector";


export default function FilialesSelector({
    filiales = [],
    filialesSelected = [],
    setSelectedFiliales = [],
    selected = [],
    setSelected,
    selectable = false,
    title = "Seleccionar filiales"
}) {

    return (
        <Table
            title={title}
            data={filiales}
            rowKey="cliente_id"
            selectable={selectable}
            selectedRows={filialesSelected}
            columns={[
                {
                    field: "nombreCliente",
                    header: "Nombre"
                },
                {
                    field: "rutCliente",
                    header: "RUT"
                },
                {
                    field: "tipoCliente",
                    header: "Tipo"
                }
            ]}
            renderExpanded={(row) => (
                <SedesSelector sedes={row.sedes} selected={selected} setSelected={setSelected} />
            )}
        />
    );
}