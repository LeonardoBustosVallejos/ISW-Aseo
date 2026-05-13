"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import Trabajador from "../entity/trabajador.entity.js";
import { cleanRut, createErrorMessage, createSimpleMessage } from "../cleaners/extras.js";
import { getRolByNameService } from "./rol.service.js";
import { registerService } from "./auth.service.js";
import { getClienteByService, getSedeByService, } from "./cliente.service.js";
import Sede from "../entity/sede.entity.js";
import TrabajadoresAsignados from "../entity/trabajadoresAsignados.entity.js";

/**
 * Busqueda estricta OR para obtener un usuario por id, rut, email o teléfono. 
 * Se puede usar cualquiera de estos criterios de búsqueda, pero se recomienda usar el id para una búsqueda más rápida y precisa.
 * @param query datos para buscar al usuario (id, rut, email o teléfono)
 * @returns usuario encontrado o mensaje de error si no se encuentra o si no se proporciona ningún criterio de búsqueda
 */
export async function getUserService(query, manager = null) {
  try {
    const { id, rut, email, phone } = query;

    const userRepository = manager ?
      manager.getRepository(User) : AppDataSource.getRepository(User);

    const where = [];

    if (id) where.push({ id });
    else if (rut) where.push({ rut: cleanRut(rut) });
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
export async function getUserByService(query, manager = null) {
  try {
    const { rut, id, email, phone } = query;

    const userRepository = manager ?
      manager.getRepository(User) : AppDataSource.getRepository(User);

    const where = {};

    if (id) where.id = id;
    else if (rut) where.rut = cleanRut(rut);
    else if (email) where.email = email;
    else if (phone) where.phone = phone;

    if (Object.keys(where).length === 0) {
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

export async function getUsersService(manager = null) {
  try {
    const userRepository = manager ?
      manager.getRepository(User) : AppDataSource.getRepository(User);

    const users = await userRepository.find();

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    const usersData = users.map(({ password, ...user }) => user);

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body, manager = null) {
  try {
    const { id, rut, email, phone } = query;

    const userRepository = manager ?
      manager.getRepository(User) : AppDataSource.getRepository(User);

    //verificar que el usuario exista
    const [userFound, errUser] = await getUserService(query, manager)

    if (errUser) return [null, errUser];

    const where = []
    if (body.rut) where.push({ rut: cleanRut(body.rut) })
    if (body.email) where.push({ email: body.email })
    if (body.phone) where.push({ phone: body.phone })

    if (Object.keys(where).length === 0) {
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
      rut: cleanRut(body.rut),
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

export async function deleteUserService(query, manager = null) {
  try {
    const { id, rut, email } = query;

    const userRepository = manager ?
      manager.getRepository(User) : AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: cleanRut(rut) }, { email: email }],
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
 * @param {false} estado 
 * @returns 
 */
export async function cambiarEstadoUsuario(query, estado = false, manager = null) {
  try {
    const execute = async (transactionManager) => {
      const { id, rut, email } = query;

      if (!id && !rut && !email) throw createErrorMessage("Usuario", "Debe proporcionar al menos un criterio de búsqueda")

      //verificar que el usuario exista
      const [userFound, err] = await getUserByService({ id, rut: cleanRut(rut), email }, transactionManager)
      if (err) throw err

      //verificar que el usuario no sea administrador
      if (userFound.rol.nombre === "Administrador") throw createErrorMessage("Usuario", "No se puede cambiar el estado de un usuario con rol de Administrador")

      const userRepository = transactionManager.getRepository(User);

      const userUpdated = await userRepository.update({ id: userFound.id }, { isActive: estado })

      if (!userUpdated.affected) throw createErrorMessage("Usuario", "No se pudo actualizar el estado del usuario")

      const userData = await userRepository.findOne({
        where: { id: userFound.id },
      });

      if (!userData) {
        throw createErrorMessage("Usuario", "Usuario no encontrado después de actualizar")
      }
      const { password, ...user } = userData;

      return [user, null];
    }
    if (manager) return await execute(manager)

    return await AppDataSource.transaction(execute)
  } catch (error) {
    console.error("Error al desactivar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Funcion que entrega el historial de personal asignado 
 * @param {*} query
 * @param {null} manager 
 * @returns lista de personal
 */
export async function getHistorialAsignacionService(query, manager = null) {
  try {
    const { cliente_id, sede_id } = query
    const AsignadoRepository = manager ?
      manager.getRepository(TrabajadoresAsignadosSchema) : AppDataSource.getRepository(TrabajadoresAsignadosSchema);

    const where = {}
    if (sede_id) where.sede = { sede_id }
    if (cliente_id) where.cliente = { cliente_id }

    const asignados = await AsignadoRepository.find({ where });
    if (!asignados || asignados.length === 0) return [null, "No hay trabajadores asignados"];

    return [asignados, null]
  } catch (error) {
    console.error("Error al obtener a los trabajadores asignados:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getAsignadosService(sede_id = null, manager = null) {
  try {
    //verificar que la sede exista
    if (sede_id) {
      const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id }, manager)
      if (errSede) return [null, errSede]
    }

    const AsignadoRepository = manager ?
      manager.getRepository(TrabajadoresAsignadosSchema) : AppDataSource.getRepository(TrabajadoresAsignadosSchema);

    const where = {}
    where.estado = "ASIGNADO"
    if (sede_id) where.sede = { sede_id: sede_id }

    const asignados = await AsignadoRepository.find({ where });
    if (!asignados || asignados.length === 0) return [null, "No hay trabajadores asignados"];

    return [asignados, null]
  } catch (error) {
    console.error("Error al obtener a los trabajadores asignados:", error);
    return [null, "Error interno del servidor"];
  }
}
export async function getSupervisoresService(sede_id = null, estado = null, manager = null) {
  try {
    if (estado && estado !== "ASIGNADO" && estado !== "REMOVIDO" && estado !== "FINALIZADO") return [null, createErrorMessage("estado", "Estado no válido")]
    const AsignadoRepository = manager ?
      manager.getRepository(TrabajadoresAsignadosSchema) : AppDataSource.getRepository(TrabajadoresAsignadosSchema);

    const where = {}
    where.rol = "SUPERVISOR"
    if (estado) where.estado = estado
    if (sede_id) where.sede = { sede_id }

    const asignados = await AsignadoRepository.find({ where });
    if (!asignados || asignados.length === 0) return [null, "No hay trabajadores asignados"];

    return [asignados, null]

  } catch (error) {
    console.error("Error al obtener a los trabajadores asignados:", error);
    return [null, "Error interno del servidor"];
  }
}
export async function getAsignadoByService(trabajador, estado = null, sede_id = null, manager = null) {
  try {
    const { id, rut, email } = trabajador

    if (estado && estado !== "ASIGNADO" && estado !== "REMOVIDO" && estado !== "FINALIZADO") return [null, createErrorMessage("estado", "Estado no válido")]

    const AsignadoRepository = manager ?
      manager.getRepository(TrabajadoresAsignados) : AppDataSource.getRepository(TrabajadoresAsignados);

    const where = {}
    if (estado) where.estado = estado
    if (sede_id) where.sede = { sede_id }
    if (id || rut || email) {
      where.trabajador = {}

      if (id) where.trabajador.id = id
      if (rut) where.trabajador.rut = cleanRut(rut)
      if (email) where.trabajador.email = email
    }

    const asignados = await AsignadoRepository.findOne({ where });
    if (!asignados) return [null, "No hay trabajadores asignados"];

    return [asignados, null]
  } catch (error) {
    console.error("Error al obtener a los trabajadores asignados:", error);
    return [null, "Error interno del servidor"];
  }
}


/**
 * 
 * @param {*} trabajador datos del trabajador a asignar, id, rut o email, debe incluir el rol que cumplirá
 * @param {*} cliente_id id del cliente al que se asignará, si no corresponde al cliente de la sede entonces se verifica que esté en la jerarquía
 * @param {*} sede_id id de la sede a la que se asignará, se verifica que exista y que no se exceda el límite de personal solicitado, además se aumenta en 1 el personal asignado a la sede
 * @param {*} manager 
 * @returns 
 */
export async function asignarPersonalService(trabajador, cliente_id, sede_id, manager = null) {
  try {
    const execute = async (transactionManager) => {
      /**parte referencial del body
     * {
     *  trabajador:{
     *    id:<>,
     *    rut:<>,
     *    email:<>,
     *    rol: "SUPERVISOR" o "TRABAJADOR"
     *   }
     * }
     */
      const { id, rut, email, rol } = trabajador
      if (!id && !rut && !email) throw createErrorMessage("trabajador", "Debe proporcionar al menos un criterio de búsqueda para el trabajador")

      if (rol !== "SUPERVISOR" && rol !== "TRABAJADOR") throw createErrorMessage("rol", "Rol no válido")

      const trabajadorRepository = transactionManager ?
        transactionManager.getRepository(Trabajador) : AppDataSource.getRepository(Trabajador);

      const where = {} //AND

      //datos para buscar al trabajador, se puede buscar por id, rut o email
      if (id) where.id = id
      if (rut) where.rut = rut
      if (email) where.email = email
      where.despedido = false   //asegura que el trabajador no esté despedido

      //verificar que el trabajador exista y no esté despedido con AND
      const trabajadorEncontrado = await trabajadorRepository.findOne({ where });
      if (!trabajadorEncontrado) throw createErrorMessage("trabajador", "Trabajador no encontrado")

      //verificar que la sede exista
      const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id }, transactionManager)
      if (errSede) throw errSede

      /*cliente de la sede encontrada*/
      let clienteSede = sedeFound.cliente

      //verificar que la sede sea del cliente o el cliente_id es padre del cliente de la sede
      let [clienteEntregado, errCliente] = await getClienteByService({ cliente_id: cliente_id }, transactionManager)
      if (errCliente) throw errCliente

      //si el cliente entregado no es el mismo que el de la sede, entonces se verifica que el cliente de la sede esté en la jerarquía del cliente entregado
      if (clienteEntregado.cliente_id !== clienteSede.cliente_id) {
        //recorrer la gerarquia hace encontrar el cliente dueño del id entregado
        while (clienteSede.clientePadre && clienteSede.cliente_id !== cliente_id) {
          clienteSede = clienteSede.clientePadre
        }
        if (clienteSede.cliente_id !== cliente_id) throw createErrorMessage("cliente_id", "La sede no pertenece al cliente o su jerarquia")
      }
      const cuposDisponibles = sedeFound.personalSolicitado - sedeFound.personalAsignado
      //verificar que no se exceda el límite de personal
      if (cuposDisponibles <= 0) throw createErrorMessage("trabajadores", `Solo quedan ${cuposDisponibles} cupos disponibles`)

      //verificar que no esté asignado ya a esta sede
      const [estaAsignado, noAsignado] = await getAsignadoByService(trabajador, "ASIGNADO", sedeFound.sede_id, transactionManager)
      if (estaAsignado) throw createErrorMessage("trabajador", "El trabajador ya está asignado a esta sede")

      let [userAsignado, errAsignacion] = [null, null]
      if (rol === "SUPERVISOR") {
        [userAsignado, errAsignacion] = await reactivarSupervisorService({ id, rut, email }, transactionManager)
        if (errAsignacion) throw errAsignacion
      }


      const AsignadoRepository = transactionManager ?
        transactionManager.getRepository(TrabajadoresAsignados) : AppDataSource.getRepository(TrabajadoresAsignados)

      const newAsignado = AsignadoRepository.create({
        estado: "ASIGNADO",
        rol: rol,
        trabajador: trabajadorEncontrado,
        usuario: userAsignado,
        sede: sedeFound,
        cliente: clienteEntregado,
      })

      await AsignadoRepository.save(newAsignado)

      const sedeRepository = transactionManager ?
        transactionManager.getRepository(Sede) : AppDataSource.getRepository(Sede)

      await sedeRepository.increment({ sede_id }, "personalAsignado", 1)

      return [newAsignado, null]

    }

    if (manager) return execute(manager)

    return AppDataSource.transaction(execute)

  } catch (error) {
    console.error("Error al asignar un trabajador", error);
    if (Array.isArray(error)) return error;
    return [null, "Error interno del servidor"]
  }
}

/**
 * Reactiva el usuario de un trabajador o lo registra en la base de datos
 * @param trabajador Datos que se usarán para buscar al trabajador que se asignará como supervisor
 * @returns perfil de usuario del nuevo supervisor o mensaje de error
 */
async function reactivarSupervisorService(trabajador, manager = null) {
  try {
    const execute = async (transactionManager) => {
      //datos de busqueda del trabajador
      const { id, rut, email } = trabajador

      if (!id && !rut && !email) throw createErrorMessage("trabajador", "Debe proporcionar al menos un criterio de búsqueda para el trabajador")

      const trabajadorRepository = transactionManager.getRepository(Trabajador);

      const where = {} //AND

      where.despedido = false   //asegura que el trabajador no esté despedido

      //datos para buscar al trabajador, se puede buscar por id, rut o email
      if (id) where.id = id
      if (rut) where.rut = rut
      if (email) where.email = email

      //verificar que el trabajador exista y no esté despedido con AND
      const trabajadorEncontrado = await trabajadorRepository.findOne({ where });
      if (!trabajadorEncontrado) throw createErrorMessage("trabajador", "Trabajador no encontrado")
      /*
          // verificar que el trabajador no sea ya supervisor
          if (trabajadorEncontrado.rol === "Supervisor") return [null, createErrorMessage("trabajador", "El trabajador ya tiene rol de Supervisor")]
      */
      //verificar si existe un usuario registrado con el mismo rut o email del trabajador y si es un usuario diferente
      const [existingRut, errRut] = await getUserService({ rut: cleanRut(trabajadorEncontrado.rut) }, transactionManager)
      if (existingRut && existingRut.email !== trabajadorEncontrado.email && !existingEmail.isActive) throw createErrorMessage("rut", "Ya existe un otro registrado con el mismo rut")

      const [existingEmail, errEmail] = await getUserService({ email: trabajadorEncontrado.email }, transactionManager)
      if (existingEmail && existingEmail.rut !== trabajadorEncontrado.rut && !existingRut.isActive) throw createErrorMessage("email", "Ya existe un otro registrado con el mismo email")

      //si pasa la verificacion de rut y email, entonces puede o no existir un usuario correspondiente

      //verificar que si existe un usuario entonces ver si está activo
      let [nuevoSupervisor, errRegister] = await getUserByService({ rut: cleanRut(trabajadorEncontrado.rut), email: trabajadorEncontrado.email }, transactionManager)

      if (errRegister) {

        //si no existe un usuario se registra

        //obtener el rol de supervisor para asignarlo al nuevo usuario
        const [rolSupervisor, errRol] = await getRolByNameService("Supervisor")
        if (errRol) throw errRol

        //seleccionar el correo antes del @ para usarlo como contraseña temporal
        const emailParts = trabajadorEncontrado.email.split("@")[0]

        //registrar el nuevo usuario del supervisor
        const [nuevoPerfil, errPerfil] = await registerService({
          nombreCompleto: trabajadorEncontrado.nombreCompleto,
          rut: cleanRut(trabajadorEncontrado.rut),
          email: trabajadorEncontrado.email,
          password: emailParts,
          rol_id: rolSupervisor.id,
        }, transactionManager)
        if (errPerfil) throw errPerfil

        //retornar el perfil del nuevo supervisor
        return [nuevoPerfil, null]

      } else if (nuevoSupervisor && nuevoSupervisor.isActive === false) {
        //si existe pero está desactivado, se reactiva
        const [nuevoEstado, errEstado] = await cambiarEstadoUsuario({ rut: cleanRut(trabajadorEncontrado.rut) }, true, transactionManager)
        if (errEstado) throw errEstado

        //retornar el perfil del supervisor reactivado
        return [nuevoEstado, null]

      }
      //if(nuevoSupervisor && nuevoSupervisor.isActive)
      return [nuevoSupervisor, null];

    }
    if (manager) return await execute(manager)

    return await AppDataSource.transaction(execute)

  } catch (error) {
    console.error("Error al asignar un supervisor:", error);
    return [null, "Error interno del servidor"];
  }
}
export async function asignarSupervisorService(trabajador, sede_id, manager = null) {
  try {
    const execute = async (transactionManager) => {
      //datos de busqueda del trabajador
      const { id, rut, email } = trabajador

      //verificar que la sede exista
      const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id }, transactionManager)
      if (errSede) throw errSede

      //verificar que no se exceda el límite de personal
      if (sedeFound.personalAsignado === sedeFound.personalSolicitado) throw createSimpleMessage("Límite de personal alcanzado")

      if (!id && !rut && !email) throw createErrorMessage("trabajador", "Debe proporcionar al menos un criterio de búsqueda para el trabajador")

      const trabajadorRepository = transactionManager.getRepository(Trabajador);

      const where = {} //AND

      where.despedido = false   //asegura que el trabajador no esté despedido

      //datos para buscar al trabajador, se puede buscar por id, rut o email
      if (id) where.id = id
      if (rut) where.rut = rut
      if (email) where.email = email

      //verificar que el trabajador exista y no esté despedido con AND
      const trabajadorEncontrado = await trabajadorRepository.findOne({ where });
      if (!trabajadorEncontrado) throw createErrorMessage("trabajador", "Trabajador no encontrado")
      /*
          // verificar que el trabajador no sea ya supervisor
          if (trabajadorEncontrado.rol === "Supervisor") return [null, createErrorMessage("trabajador", "El trabajador ya tiene rol de Supervisor")]
      */
      //verificar si existe un usuario registrado con el mismo rut o email del trabajador y si es un usuario diferente
      const [existingRut, errRut] = await getUserService({ rut: cleanRut(trabajadorEncontrado.rut) }, transactionManager)
      if (existingRut && existingRut.email !== trabajadorEncontrado.email) throw createErrorMessage("rut", "Ya existe un otro registrado con el mismo rut")

      const [existingEmail, errEmail] = await getUserService({ email: trabajadorEncontrado.email }, transactionManager)
      if (existingEmail && existingEmail.rut !== trabajadorEncontrado.rut) throw createErrorMessage("email", "Ya existe un otro registrado con el mismo email")

      //si pasa la verificacion de rut y email, entonces puede o no existir un usuario correspondiente

      //verificar que si existe un usuario entonces ver si está activo
      let [nuevoSupervisor, errRegister] = await getUserByService({ rut: cleanRut(trabajadorEncontrado.rut), email: trabajadorEncontrado.email }, transactionManager)
      let usuarioCreado = false

      if (errRegister) {

        //si no existe un usuario se registra

        //obtener el rol de supervisor para asignarlo al nuevo usuario
        const [rolSupervisor, errRol] = await getRolByNameService("Supervisor")
        if (errRol) throw errRol

        //seleccionar el correo antes del @ para usarlo como contraseña temporal
        const emailParts = trabajadorEncontrado.email.split("@")[0];

        const datosSupervisor = {
          nombreCompleto: trabajadorEncontrado.nombreCompleto,
          rut: cleanRut(trabajadorEncontrado.rut),
          email: trabajadorEncontrado.email,
          password: emailParts,
          rol_id: rolSupervisor.id,
        }

        //registrar el nuevo usuario del supervisor
        const [nuevoPerfil, errPerfil] = await registerService({
          nombreCompleto: trabajadorEncontrado.nombreCompleto,
          rut: cleanRut(trabajadorEncontrado.rut),
          email: trabajadorEncontrado.email,
          password: emailParts,
          rol_id: rolSupervisor.id,
        }, transactionManager)
        if (errPerfil) throw errPerfil
        nuevoSupervisor = nuevoPerfil
        usuarioCreado = true

      } else if (nuevoSupervisor && !nuevoSupervisor.isActive) {
        //si existe pero está desactivado, se reactiva
        const [nuevoEstado, errEstado] = await cambiarEstadoUsuario({ rut: cleanRut(trabajadorEncontrado.rut) }, true, transactionManager)
        if (errEstado) throw errEstado
        nuevoSupervisor = nuevoEstado

      }


      if (trabajadorEncontrado.rol !== "Supervisor") {
        //actualizar rol del trabajador a Supervisor
        const trabajadorUpdated = await trabajadorRepository.update({ id: trabajadorEncontrado.id }, { rol: "Supervisor" })
        if (!trabajadorUpdated.affected) {
          if (usuarioCreado && !transactionManager) await deleteUserService({ id: nuevoSupervisor.id })
          throw createSimpleMessage("No se pudo actualizar el rol del trabajador")
        }
      }
      //si cumple con todo lo anterior, se asigna un nuevo supervisor a la sede, aumentando en 1 el personal asignado a la sede
      const sedeRepository = transactionManager.getRepository(Sede);

      const nuevoPersonal = await sedeRepository.createQueryBuilder()
        .update(Sede)
        .set({ personalAsignado: () => `"personalAsignado" + 1` })
        .where("sede_id = :id", { id: sede_id })
        .andWhere(`"personalAsignado" < "personalSolicitado"`)
        .execute();

      if (!nuevoPersonal.affected) {
        if (!manager) {
          if (usuarioCreado) await deleteUserService({ id: nuevoSupervisor.id })
          await trabajadorRepository.update({ id: trabajadorEncontrado.id }, { rol: "trabajador" })
        }
        throw createSimpleMessage("No se pudo actualizar el trabajador")
      }
      console.log("Personal asignado cambiado:", nuevoPersonal);

      return [nuevoSupervisor, null];

    }
    if (manager) return await execute(manager)

    return await AppDataSource.transaction(execute)
  } catch (error) {
    console.error("Error al asignar un supervisor:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateEstadoTrabajadorAsignado(trabajador, sede_id, estado, manager = null) {
  try {
    const execute = async (transactionManager) => {

      const estadosValidos = ["ASIGNADO", "REMOVIDO", "FINALIZADO"]
      if (!estadosValidos.includes(estado)) throw createErrorMessage("estado", "Estado no válido")

      const [trabajadorAsignado, errAsignacion] = await getAsignadoByService(trabajador, "ASIGNADO", sede_id, transactionManager)
      if (errAsignacion) throw errAsignacion

      //evitar dejar sede sin supervisor
      if (trabajadorAsignado.rol === "SUPERVISOR") {
        const [supervisores, errSupervisores] = await getSupervisoresService(sede_id, "ASIGNADO", transactionManager)
        if (supervisores.length <= 1) throw createErrorMessage("supervisor", "La sede debe tener al menos un supervisor asignado")
      }
      const asignadoRepository = transactionManager.getRepository(TrabajadoresAsignados)

      await asignadoRepository.update(
        { id_asignacion: trabajadorAsignado.id_asignacion },
        {
          estado: estado,
          fechaTermino: estado !== "ASIGNADO" ? new Date() : null
        })


      const sedeRepository = transactionManager.getRepository(Sede)
      await sedeRepository.decrement({ sede_id }, "personalAsignado", 1)
      const asignacionActualizada = await asignadoRepository.findOne({
        where: { id_asignacion: trabajadorAsignado.id_asignacion },
        relations: ["trabajador", "usuario", "cliente", "sede"]
      })
      return [asignacionActualizada, null]
    }

    if (manager) return execute(manager)

    return AppDataSource.transaction(execute)
  } catch (error) {
    console.error("Error al actualizar asignación", error);
    if (Array.isArray(error)) return error;
    return [null, "Error interno del servidor"]
  }
}


export async function asignarSupervisorJerarquicoService(trabajadores, sede_id, cliente_id, manager = null) {
  try {
    const execute = async (transactionManager) => {
      const trabajadoresAsignados = []
      const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id }, transactionManager)
      if (errSede) throw errSede

      const cuposDisponibles = sedeFound.personalSolicitado - sedeFound.personalAsignado

      if (trabajadores.length > cuposDisponibles) throw createErrorMessage("trabajadores", `Solo quedan ${cuposDisponibles} cupos disponibles`)

      //recorrer la lista de supervisores a asignar
      for (const trabajador_id of trabajadores || []) {
        const [supervisor, errSupervisor] = await asignarPersonalService(
          { id: trabajador_id, rol: "SUPERVISOR" },
          cliente_id,
          sede_id,
          transactionManager)
        if (errSupervisor) throw errSupervisor
        trabajadoresAsignados.push(supervisor)
      }
      return [trabajadoresAsignados, null]
    }

    if (manager) return await execute(manager)
    return await AppDataSource.transaction(execute)
  } catch (error) {
    console.error("Error al asignar un supervisor", error);
    if (Array.isArray(error)) return error;
    return [null, "Error interno del servidor"]
  }
}