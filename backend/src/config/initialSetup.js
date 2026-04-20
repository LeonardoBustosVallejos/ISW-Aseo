"use strict";
import User from "../entity/user.entity.js";
import Rol from "../entity/rol.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import Cliente from "../entity/cliente.entity.js";

async function createRoles() {
  try {
    const rolesRepository = AppDataSource.getRepository(Rol)

    const count = await rolesRepository.count();
    if (count > 0) return;

    await Promise.all([
      rolesRepository.save(
        rolesRepository.create({
          id: 1,
          nombre: "Administrador",
        })
      ),
      rolesRepository.save(
        rolesRepository.create({
          id: 2,
          nombre: "Cliente"
        })
      ),
      rolesRepository.save(
        rolesRepository.create({
          id: 3,
          nombre: "Supervisor"
        })
      ),
      rolesRepository.save(
        rolesRepository.create({
          id: 4,
          nombre: "Trabajador"
        })
      )
    ])
    console.log("* => Roles creados exitosamente");
  } catch (error) {
    console.error("Error al crear roles:", error);
  }
}
async function createClients() {
  try {
    const clientRepository = AppDataSource.getRepository(Cliente)

    const count = await clientRepository.count()
    if (count > 0) return;

    await Promise.all([
      clientRepository.save(
        clientRepository.create({
          nombreCliente: "Empresa Genérica S.A.",
          direccion: "Calle Genérica 111",
        })
      )
    ])
    console.log("* => Clientes creados exitosamente");
  } catch (error) {
    console.error("Error al crear clientes: ", error);

  }
}

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count();
    if (count > 0) return;

    await Promise.all([
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Salazar Jara",
          rut: "21308770-3",
          email: "administrador2026@gmail.com",
          password: await encryptPassword("admin1234"),
          rol: 1,
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "CEO Genérico",
          rut: "81151897-9",
          email: "usuario1.2026@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 2,
          cliente: 1
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Alexander Benjamín Marcelo Carrasco Fuentes",
          rut: "20630735-8",
          email: "usuario2.2026@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 3,
          cliente: 1,
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Pablo Andrés Castillo Fernández",
          rut: "20738450-K",
          email: "usuario3.2026@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Felipe Andrés Henríquez Zapata",
          rut: "20976635-3",
          email: "usuario4.2026@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Meza Ortega",
          rut: "21172447-1",
          email: "usuario5.2026@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Juan Pablo Rosas Martin",
          rut: "20738415-1",
          email: "usuario6.2026@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createRoles, createClients, createUsers };