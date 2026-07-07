import AddButton from "../../components/misc/add-button";
import Header from "../../components/misc/Header";




export default function VistaDocumentosComerciales() {
    return (<>
        <Header title={'Contratos Comerciales'}>
            <AddButton text={'Nuevo Contrato/Anexo'} />
        </Header>
    </>)
}