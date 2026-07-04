import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

export default function ContratosTable({ contratos }) {
    const contratoExpansion = (contrato) => {

        return (

            <div>

                <h4>Documentos</h4>

                <DataTable
                    value={contrato.documentos}
                >

                    <Column
                        field="nombreArchivo"
                        header="Archivo"
                    />

                    <Column
                        body={(row) => (

                            <Button
                                icon="pi pi-download"
                                onClick={() =>
                                    descargarDocumento(
                                        row.id_documento
                                    )
                                }
                            />

                        )}
                    />

                </DataTable>

            </div>

        );
    };

    return (
        <DataTable
            value={contratos}
            rowExpansionTemplate={contratoExpansion}
        >

            <Column expander />

            <Column
                field="codigoContrato"
                header="Código"
            />

            <Column
                field="estado"
                header="Estado"
            />

            <Column
                field="monto"
                header="Monto"
            />

        </DataTable>
    )
}