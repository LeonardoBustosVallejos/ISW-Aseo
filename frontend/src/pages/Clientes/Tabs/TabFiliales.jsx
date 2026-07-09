
import { Table } from "../../../components/Tabla2";

export default function TabFiliales({ filiales }) {
    return (
        <Table
            title={'Filiales'}
            emptyMessage="No existen filiales"
            rowKey={'cliente_id'}
            columns={[{
                field: "nombreCliente",
                header: "Nombre"
            },
            {
                field: "rutCliente",
                header: "RUT"
            },
            {
                field: "createdAt",
                header: 'Adicion'
            }
            ]}
            data={filiales}
        />


    )
}