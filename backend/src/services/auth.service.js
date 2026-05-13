"use strict";
import User from "../entity/user.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

import { getRolByIdService, getRolByNameService } from "./rol.service.js";
import { getUserService } from "./user.service.js";
import { getClienteByService, getContactoByService, getSedeByService } from "./cliente.service.js";
import { cleanRut } from "../cleaners/extras.js";

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

export async function loginService(user) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = user;


    const userFound = await userRepository.findOne({
      relations: ["rol"],
      where: { email: email, isActive: true },
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
export async function registerService(nuevoUsuario, manager = null) {
  try {
    const userRepository = manager ?
      manager.getRepository(User) : AppDataSource.getRepository(User);

    const [nuevoRol, errRol] = await getRolByIdService(nuevoUsuario.rol_id)
    if (errRol) return [null, errRol];

    //verificar que el los datos del nuevo usuario no estén en un contacto o usuario
    const [existingEmailContacto, errEmailContacto] = await getContactoByService({ email: nuevoUsuario.email }, manager)
    const [existingEmailUser, errEmailUser] = await getUserService({ email: nuevoUsuario.email }, manager);

    if (existingEmailUser || existingEmailContacto) {
      return [null, createErrorMessage("email", "Correo electrónico ya en uso")];
    }

    const [existingRutUser, errRutUser] = await getUserService({ rut: cleanRut(nuevoUsuario.rut) }, manager);
    const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: cleanRut(nuevoUsuario.rut) }, manager)
    const [existingRutCliente, errRutCliente] = await getClienteByService({ rutCliente: cleanRut(nuevoUsuario.rut) }, manager)


    if (existingRutUser || existingRutContacto || existingRutCliente) return [null, createErrorMessage("rut", "Rut ya en uso")];
    if (nuevoUsuario.phone) {
      const [existingPhoneContacto, errPhoneContacto] = await getContactoByService({ phone: nuevoUsuario.phone }, manager)
      const [existingPhoneUser, errPhoneUser] = await getUserService({ phone: nuevoUsuario.phone }, manager)

      if (existingPhoneUser || existingPhoneContacto) return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")];
    }

    //usuario principal
    const newUser = userRepository.create({
      nombreCompleto: nuevoUsuario.nombreCompleto,
      email: nuevoUsuario.email,
      rut: cleanRut(nuevoUsuario.rut),
      password: await encryptPassword(nuevoUsuario.password),
      phone: nuevoUsuario.phone || null,
      rol: nuevoUsuario.rol_id,
    });


    await userRepository.save(newUser);

    const { password, ...dataUser } = newUser;

    return [dataUser, null];

  } catch (error) {
    console.error("Error al registrar un usuario", error);
    return [null, "Error interno del servidor"];
  }
}

