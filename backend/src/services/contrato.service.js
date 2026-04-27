import Contrato from "../entity/contrato.entity.js";
import { AppDataSource } from "../config/configDb.js";
import Clientes from "../entity/cliente.entity.js";
import UserSchema from "../entity/user.entity.js";


export async function createContratoService(data) {
    try {
        const contratoRepository = AppDataSource.getRepository(Contrato);
        const clienteRepository = AppDataSource.getRepository(Clientes);
        const userRepository = AppDataSource.getRepository(User);

        const { cliente_id, usuario_id, fechaInicio, fechaFin, archivo } = data;

        //verificar que a quien vaya dirigido exista
        const usuarios = await userRepository.findOne({
            where: { usuario_id }
        });

        const cliente = await clienteRepository.findOne({
            where: { cliente_id }
        });

        if (!usuarios || !cliente) return [null, "No existe destinatario del contrato"]

        const contrato = contratoRepository.create({
            fechaInicio,
            fechaFin,
            archivo,
            cliente: cliente.usuario_id || null,
            usuario: usuario_id
        });

        await contratoRepository.save(contrato)

        return [contrato, null]

    } catch (error) {
        console.error("Error creando contrato", error);
        return [null, "Error interno"];
    }
}



//NOTA: el contrato debería agregarse al mismo tiempo que se registra un nuevo usuario