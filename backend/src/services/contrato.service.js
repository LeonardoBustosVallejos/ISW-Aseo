import Contrato from "../entity/contratoComercial.entity.js";
import { AppDataSource } from "../config/configDb.js";
import Clientes from "../entity/cliente.entity.js";
import User from "../entity/user.entity.js";
import Sedes from "../entity/sede.entity.js";
import { createErrorMessage } from "../cleaners/extras.js";
import { getClienteByService, getSedeByService } from "./cliente.service.js";
import { getTopJerarquía } from "./user.service.js";


export async function createContratoComercialService(data, cliente_id, manager = null) {
    try {
        const execute = async (transactionManager) => {

            const contratoRepository = transactionManager.getRepository(Contrato);
            const clienteRepository = transactionManager.getRepository(Clientes);
            const sedeRepository = transactionManager.getRepository(Sedes)


            const { fechaInicio, fechaFinOriginal, fechaFinReal, monto, descripcion } = data

            if (!fechaInicio || !fechaFinOriginal || !monto || !cliente_id) throw [null, createErrorMessage("contrato", "datos incompletos")]

            if ((fechaInicio >= fechaFinOriginal) ||
                (fechaInicio >= fechaFinReal) ||
                (fechaFinOriginal <= fechaFinReal)) throw [null, createErrorMessage("fecha", "Fechas no válidas")]

            const [clienteFound, errCliente] = await getClienteByService({ cliente_id: cliente_id }, transactionManager)
            if (errCliente) throw [null, errCliente]

            const [representante, errRep] = await getTopJerarquía(clienteFound.cliente_id, transactionManager)
            if (errRep) throw [null, errRep]


            const contrato = contratoRepository.create({
                codigoContrato: `COM-${representante.cliente_id}-${representante.nombreCliente}`,
                fechaInicio: fechaInicio,
                fechaFinOriginal: fechaFinOriginal,
                fechaFinReal: fechaFinReal ? fechaFinReal : fechaFinOriginal,
                monto: monto,
                cliente: representante.cliente_id,
                //sede: sede_id
            });

            await contratoRepository.save(contrato)

            return [contrato, null]
        }
        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        console.error("Error creando contrato", error);
        return [null, "Error interno"];
    }
}



//NOTA: el contrato debería agregarse al mismo tiempo que se registra un nuevo cliente o trabajador