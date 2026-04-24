"use strict";
import User from "../entity/user.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import Rol from "../entity/rol.entity.js";
import Cliente from "../entity/cliente.entity.js";

const createErrorMessage = (dataInfo, message) => ({
  dataInfo,
  message
});

/**
 * funcion que transforma un rut de formato xx.xxx.xxx-y a xxxxxxxx-y,
 * solo elimina los puntos y posible 0 inicial
 * @param {string} rut rut a transformar
 * @returns rut en formato xxxxxxxx-y
 */
function cleanRut(rut) {
  return rut.replace(/\./g, "").replace(/^0+/, "");
}

export async function loginService(user) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = user;


    const userFound = await userRepository.findOne({
      relations: ["rol", "cliente"],
      where: { email: email }
    });

    if (!userFound) {
      return [null, createErrorMessage("email", "Correo o contraseña incorrectos")];
    }

    const isMatch = await comparePassword(password, userFound.password);

    if (!isMatch) {
      return [null, createErrorMessage("password", "Correo o contraseña incorrectos")];
    }

    const payload = {
      nombreCompleto: userFound.nombreCompleto,
      email: userFound.email,
      rut: userFound.rut,
      rol: userFound.rol,
      cliente: userFound.cliente
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    return [accessToken, null];
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Solo el administrador puede registrar nuevos usuarios
*/
export async function registerService(nuevoUsuario, cliente_id) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const rolRepository = AppDataSource.getRepository(Rol)
    const clienteRepository = AppDataSource.getRepository(Cliente);

    //si se entrego un id de cliente entonces verificar que ese cliente exista
    if (cliente_id) {
      const existingClient = await clienteRepository.findOne({ where: { cliente_id: cliente_id } })
      if (!existingClient) return [null, { dataInfo: "cliente_id", message: "No existe cliente" }]
    }

    const nuevoRol = await rolRepository.findOne({ where: [{ id: nuevoUsuario.rol_id }] })
    if (!nuevoRol) return [null, "Rol inválido"];

    //verificar campos únicos
    const existingUser = await userRepository.findOne({ where: { email: nuevoUsuario.email, rut: cleanRut(nuevoUsuario.rut) }, });
    if (existingUser) return [null, createErrorMessage("rut o email", "Rut o correo electrónico ya en uso")];

    if (nuevoUsuario.phone) {
      const existingPhoneUser = await userRepository.findOne({ where: { phone: nuevoUsuario.phone } })
      if (existingPhoneUser) return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")];
    }

    //verificar que, si se está creando un supervisor, 
    const rolSupervisor = await rolRepository.findOneBy({ nombre: "Supervisor" })

    //el cliente al que se le está asignando no tenga otro ya registrado
    if (nuevoUsuario.rol_id == rolSupervisor.id && cliente_id) {

      const existingSupervisor = await userRepository.findOne({
        where: [
          {
            rol: { id: rolSupervisor.id },
            cliente: { cliente_id: cliente_id },
          }
        ]
      })
      console.log(rolSupervisor);

      console.log(existingSupervisor);

      if (existingSupervisor) return [null, "El cliente ya tiene un supervisor"];
    }
    //usuario principal
    const newUser = userRepository.create({
      nombreCompleto: nuevoUsuario.nombreCompleto,
      email: nuevoUsuario.email,
      rut: cleanRut(nuevoUsuario.rut),
      password: await encryptPassword(nuevoUsuario.password),
      phone: nuevoUsuario.phone || null,
      rol: nuevoUsuario.rol_id,
      cliente: cliente_id || null
    });


    await userRepository.save(newUser);

    const { password, ...dataUser } = newUser;

    return [dataUser, null];

  } catch (error) {
    console.error("Error al registrar un usuario", error);
    return [null, "Error interno del servidor"];
  }
}


export async function registerClientService(cliente, supervisor) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const rolRepository = AppDataSource.getRepository(Rol)
    const clienteRepository = AppDataSource.getRepository(Cliente);

    const { nombreCliente, direccion, personalSolicitado } = cliente;

    //el cliente y supervisor no pueden tener el mismo rut
    if (cliente.rut === supervisor.rut) return [null, { dataInfo: "rut", message: "Rut duplicado" }]

    //comprobacion de campos únicos
    const existingUser = await userRepository.findOne({ where: { email: cliente.email, rut: cleanRut(cliente.rut) }, });
    if (existingUser) return [null, createErrorMessage("rut o email", "Rut o correo electrónico en uso")];

    if (cliente.phone) {
      const existingPhoneUser = await userRepository.findOne({ where: { phone: cliente.phone } })
      if (existingPhoneUser) return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")];
    }


    const nuevoCliente = clienteRepository.create({
      nombreCliente: nombreCliente,
      direccion: direccion,
      personalSolicitado: personalSolicitado
    });

    //registrar en la tabla cliente
    const clienteCreado = await clienteRepository.save(nuevoCliente)
    console.log(clienteCreado);

    //registrar datos del nuevo cliente como usuario
    const [usuarioCliente, errCliente] = await registerService(cliente, nuevoCliente.cliente_id)
    if (errCliente) {
      await clienteRepository.remove(clienteCreado)
      return [null, errCliente]
    };


    //registrar un nuevo usuario como supervisor del nuevo cliente
    const [usuarioSupervisor, errSupervisor] = await registerService(supervisor, nuevoCliente.cliente_id)
    if (errSupervisor) {
      await clienteRepository.remove(clienteCreado)
      return [null, errSupervisor];
    }
    /**
     * Ante cualquier error se eliminará en cascada los datos ingresados, 
     * para evitar espacio ocupado innecesariamente
     */

    return [{
      Cliente: clienteCreado,
      usuarioCliente,
      usuarioSupervisor
    }, null]


  } catch (error) {
    console.error("Error al registrar un cliente", error);
    return [null, "Error interno del servidor"];
  }
}