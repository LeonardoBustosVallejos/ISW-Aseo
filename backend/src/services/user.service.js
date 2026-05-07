"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import Trabajador from "../entity/trabajador.entity.js";
import Rol from "../entity/rol.entity.js";
import { createErrorMessage } from "../handlers/messages.js";
import { getRolByNameService } from "./rol.service.js";
import { registerService } from "./auth.service.js";
import { updateTrabajadorService } from "./trabajador.service.js";
import { getSedeByService, updateSedeService } from "./cliente.service.js";

/**
 * Busqueda estricta OR para obtener un usuario por id, rut, email o teléfono. 
 * Se puede usar cualquiera de estos criterios de búsqueda, pero se recomienda usar el id para una búsqueda más rápida y precisa.
 * @param query datos para buscar al usuario (id, rut, email o teléfono)
 * @returns usuario encontrado o mensaje de error si no se encuentra o si no se proporciona ningún criterio de búsqueda
 */
export async function getUserService(query) {
  try {
    const { rut, id, email, phone } = query;

    const userRepository = AppDataSource.getRepository(User);

    const where = [];

    if (id) where.push({ id });
    else if (rut) where.push({ rut });
    else if (email) where.push({ email });
    else if (phone) where.push({ phone });

    if (!where.length) {
      return [null, "Debe proporcionar al menos un criterio de búsqueda"];
    }

    const userFound = await userRepository.findOne({ where });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { password, ...userData } = userFound;

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}
/**
 * Busqueda estricta AND para obtener un usuario por campos unicos id, rut, email o teléfono. 
 * Se deben proporcionar al menos dos de estos criterios de búsqueda para una búsqueda más precisa aunque tambien se puede usar solo uno.
 * @param query 
 * @returns 
 */
export async function getUserByService(query) {
  try {
    const { rut, id, email, phone } = query;

    const userRepository = AppDataSource.getRepository(User);

    const where = {};

    if (id) where.id = id;
    else if (rut) where.rut = rut;
    else if (email) where.email = email;
    else if (phone) where.phone = phone;

    if (!where.length) {
      return [null, "Debe proporcionar al menos un criterio de búsqueda"];
    }

    const userFound = await userRepository.findOne({ where });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { password, ...userData } = userFound;

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find();

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    const usersData = users.map(({ password, ...user }) => user);

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body) {
  try {
    const { id, rut, email, phone } = query;

    const userRepository = AppDataSource.getRepository(User);

    //verificar que el usuario exista
    const userFound = await getUserService(query)

    if (!userFound) return [null, "Usuario no encontrado"];

    where = []
    if (rut) where.push({ rut: body.rut })
    if (email) where.push({ email: body.email })
    if (phone) where.push({ phone: body.phone })

    if (!where.length) {
      return [null, "Debe proporcionar al menos un criterio de búsqueda para actualizar"];
    }
    //verificar que el nuevo rut, email o teléfono no estén registrados en otro usuario
    const existingUser = await userRepository.findOne({ where, });

    if (existingUser && existingUser.id !== userFound.id) {
      return [null, "Ya existe un usuario con el mismo rut, email o teléfono"];
    }

    if (body.password) {
      const matchPassword = await comparePassword(
        body.password,
        userFound.password,
      );

      if (!matchPassword) return [null, "La contraseña no coincide"];
    }

    const dataUserUpdate = {
      nombreCompleto: body.nombreCompleto,
      rut: body.rut,
      email: body.email,
      rol_id: body.rol,
      updatedAt: new Date(),
      sede: body.sede_id,
    };

    if (body.newPassword && body.newPassword.trim() !== "") {
      dataUserUpdate.password = await encryptPassword(body.newPassword);
    }

    await userRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    const { password, ...userUpdated } = userData;

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteUserService(query) {
  try {
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.rol === "Administrador") {
      return [null, "No se puede eliminar un usuario con rol de Administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { password, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * 
 * @param query datos utilizados para una busqueda estricta
 * @param nuevoEstado nuevo estado del usuario ACTIVADO ó DESACTIVADO
 * @returns 
 */
export async function cambiarEstadoUsuario(query, nuevoEstado) {
  try {
    const { id, rut, email } = query;

    if (!id && !rut && !email) return [null, "Debe proporcionar al menos un criterio de búsqueda"];

    //verificar que el usuario exista
    const [userFound, err] = await getUserByService({ id, rut, email })
    if (err) return [null, err]

    //verificar que el estado sea válido
    if (nuevoEstado !== "ACTIVADO" && nuevoEstado !== "DESACTIVADO") return [null, createErrorMessage("state", "Estado no válido")]

    //verificar que el usuario no sea administrador
    if (userFound.rol === "Administrador") return [null, "No se puede cambiar el estado de un usuario con rol de Administrador"];

    const userRepository = AppDataSource.getRepository(User);

    const userUpdated = await userRepository.update({ id: userFound.id }, { state: nuevoEstado })

    if (!userUpdated.affected) return [null, "No se pudo actualizar el estado del usuario"]

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }
    const { password, ...user } = userData;

    return [user, null];

  } catch (error) {
    console.error("Error al desactivar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Asigna el rol de supervisor a un trabajador y lo registra como usuario en la base de datos, asociándolo a la sede correspondiente
 * @param trabajador Datos que se usarán para buscar al trabajador que se asignará como supervisor 
 * @param sede_id ID de la sede a la que se le asignará el supervisor 
 * @returns 
 */
export async function asignarSupervisorService(trabajador, sede_id) {
  try {
    //datos de busqueda del trabajador
    const { id, rut, email } = trabajador

    //verificar que la sede exista
    const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id })
    if (errSede) return [null, errSede]

    if (!id && !rut && !email) return [null, createErrorMessage("trabajador", "Debe proporcionar al menos un criterio de búsqueda para el trabajador")]

    const trabajadorRepository = AppDataSource.getRepository(Trabajador);

    const where = {}

    where.despedido = false   //asegura que el trabajador no esté despedido

    //datos para buscar al trabajador, se puede buscar por id, rut o email
    if (id) where.id = id
    if (rut) where.rut = rut
    if (email) where.email = email

    //verificar que el trabajador exista y no esté despedido con AND
    const trabajadorEncontrado = await trabajadorRepository.findOne({ where });
    if (!trabajadorEncontrado) return [null, createErrorMessage("trabajador", "Trabajador no encontrado")];

    // verificar que el trabajador no sea ya supervisor
    if (trabajadorEncontrado.rol === "Supervisor") return [null, createErrorMessage("trabajador", "El trabajador ya tiene rol de Supervisor")]

    //verificar que no exista un usuario registrado con el mismo rut o email del trabajador
    const [existingRut, errRut] = await getUserService({ rut: trabajadorEncontrado.rut })
    if (existingRut) return [null, createErrorMessage("rut", "Ya existe un usuario registrado con el mismo rut")]

    const [existingEmail, errEmail] = await getUserService({ email: trabajadorEncontrado.email })
    if (existingEmail) return [null, createErrorMessage("email", "Ya existe un usuario registrado con el mismo email")]

    //obtener el rol de supervisor para asignarlo al nuevo usuario
    const [rolSupervisor, errRol] = await getRolByNameService("Supervisor")
    if (errRol) return [null, errRol]

    //seleccionar el correo antes del @ para usarlo como contraseña temporal
    const emailParts = trabajadorEncontrado.email.split("@")[0];

    const datosTrabajador = {
      nombreCompleto: trabajadorEncontrado.nombreCompleto,
      rut: trabajadorEncontrado.rut,
      email: trabajadorEncontrado.email,
      password: emailParts,
      rol_id: rolSupervisor.id,
    }

    const [nuevoSupervisor, errRegister] = await registerService(datosTrabajador, sede_id)

    if (errRegister) return [null, errRegister]

    //actualizar rol del trabajador a Supervisor
    const [trabajadorUpdated, errUpdate] = await updateTrabajadorService(trabajadorEncontrado.id, { rol: "Supervisor" })
    if (errUpdate) return [null, errUpdate]


    const [nuevoPersonal, errUpdateSede] = await updateSedeService(sede_id, { personalAsignado: sedeFound.personalAsignado + 1 })
    if (errUpdateSede) {
      await updateTrabajadorService(trabajador.id, { rol: "trabajador" })
      return [null, errUpdateSede]
    }
    return [nuevoSupervisor, null];


  } catch (error) {
    console.error("Error al asignar un supervisor:", error);
    return [null, "Error interno del servidor"];
  }
}