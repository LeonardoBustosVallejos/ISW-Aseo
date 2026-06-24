"use strict";
import User from "../entity/user.entity.js";
import Rol from "../entity/rol.entity.js";
import Cliente from "../entity/cliente.entity.js";
import Contacto from "../entity/contacto.entity.js";
import Sede from "../entity/sede.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createRoles() {
  try {
    const rolesRepository = AppDataSource.getRepository(Rol);

    const count = await rolesRepository.count();
    if (count > 0) return;

    await Promise.all([
      rolesRepository.save(rolesRepository.create({ id: 1, nombre: "Administrador" })),
      rolesRepository.save(rolesRepository.create({ id: 2, nombre: "Cliente" })),
      rolesRepository.save(rolesRepository.create({ id: 3, nombre: "Supervisor" })),
      rolesRepository.save(rolesRepository.create({ id: 4, nombre: "Trabajador" })),
    ]);
    console.log("* => Roles creados exitosamente");
  } catch (error) {
    console.error("Error al crear roles:", error);
  }
}

async function createClientes() {
  try {
    const clientRepository = AppDataSource.getRepository(Cliente);

    const count = await clientRepository.count();
    if (count > 0) return;

    await Promise.all([
      clientRepository.save(
        clientRepository.create({
          nombreCliente: "Empresa Genérica S.A.",
          rutCliente: "98765432-1",
          direccion: "Calle Genérica 111",
        })
      ),
    ]);
    console.log("* => Clientes creados exitosamente");
  } catch (error) {
    console.error("Error al crear clientes: ", error);
  }
}

async function createSedes() {
  try {
    const SedeRepository = AppDataSource.getRepository(Sede);

    const count = await SedeRepository.count();
    if (count > 0) return;

    await Promise.all([
      SedeRepository.save(
        SedeRepository.create({
          nombre_sede: "Nombre Ciudad 1",
          direccion: "Calle Genérica 111, Concepción",
          personalSolicitado: 12,
          tipoSede: "PRINCIPAL",
          cliente: 1,
        })
      ),
      SedeRepository.save(
        SedeRepository.create({
          nombre_sede: "Nombre Ciudad 2",
          direccion: "Calle Genérica 111, Chillán",
          personalSolicitado: 12,
          tipoSede: "SUCURSAL",
          cliente: 1,
        })
      ),
    ]);
    console.log("* => Sedes creadas exitosamente");
  } catch (error) {
    console.error("Error al crear sedes: ", error);
  }
}

async function createContactos() {
  try {
    const ContactoRepository = AppDataSource.getRepository(Contacto);

    const count = await ContactoRepository.count();
    if (count > 0) return;

    await Promise.all([
      ContactoRepository.save(
        ContactoRepository.create({
          contacto_rut: "22222222-2",
          nombreContacto: "Contacto numero 1",
          email: "contacto1@gmail.com",
          phone: "+56 977777777",
          tipoContacto: "PRINCIPAL",
          cliente: 1,
          sede: 1,
        })
      ),
      ContactoRepository.save(
        ContactoRepository.create({
          contacto_rut: "99999999-9",
          nombreContacto: "Contacto numero 2",
          email: "contacto2@gmail.com",
          phone: "+56 988888888",
          tipoContacto: "PRINCIPAL",
          cliente: 1,
          sede: 2,
        })
      ),
    ]);
    console.log("* => Contactos creados exitosamente");
  } catch (error) {
    console.error("Error al crear contactos: ", error);
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
          email: "administrador@gmail.com",
          password: await encryptPassword("admin1234"),
          rol: 1,
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "CEO Genérico",
          rut: "81151897-9",
          email: "usuario1@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 2,
          cliente: 1,
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Alexander Benjamín Marcelo Carrasco Fuentes",
          rut: "20630735-8",
          email: "usuario2@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 3,
          cliente: 1,
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Pablo Andrés Castillo Fernández",
          rut: "20738450-K",
          email: "usuario3@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Felipe Andrés Henríquez Zapata",
          rut: "20976635-3",
          email: "usuario4@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Meza Ortega",
          rut: "21172447-1",
          email: "usuario5@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Juan Pablo Rosas Martin",
          rut: "20738415-1",
          email: "usuario6@gmail.com",
          password: await encryptPassword("user1234"),
          rol: 4,
        })
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

async function createTrabajadores() {
  try {
    const trabajadoresRepository = AppDataSource.getRepository("Trabajador");

    const count = await trabajadoresRepository.count();
    if (count > 0) return;

    const trabajadoresData = [
      {
        nombres: "Carlos Andrés",
        apellidoPaterno: "Muñoz",
        apellidoMaterno: "Rojas",
        rut: "17345221-9",
        nacimiento: "1982-04-15",
        email: "carlos.munoz@gmail.cl",
        rol: 4, 
        sexo: "M",
        competencias: "Limpieza de oficinas, manejo de insumos",
        despedido: false,
      },
      {
        nombres: "María Fernanda",
        apellidoPaterno: "Pérez",
        apellidoMaterno: "Soto",
        rut: "18765432-1",
        nacimiento: "1990-11-03",
        email: "maria.soto@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Atención al cliente, orden de bodega",
        despedido: false,
      },
      {
        nombres: "Luis Alberto",
        apellidoPaterno: "González",
        apellidoMaterno: "Díaz",
        rut: "16543210-7",
        nacimiento: "1978-06-22",
        email: "luis.gonzalez@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Manejo de maquinaria, logística",
        despedido: false,
      },
      {
        nombres: "Camila Andrea",
        apellidoPaterno: "Herrera",
        apellidoMaterno: "López",
        rut: "19876543-2",
        nacimiento: "1995-09-10",
        email: "camila.herrera@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Recepción, atención telefónica",
        despedido: false,
      },
      {
        nombres: "Jorge Luis",
        apellidoPaterno: "Araya",
        apellidoMaterno: "Morales",
        rut: "15234567-8",
        nacimiento: "1975-02-28",
        email: "jorge.araya@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Mantención, electricidad básica",
        despedido: false,
      },
      {
        nombres: "Daniela Paz",
        apellidoPaterno: "Contreras",
        apellidoMaterno: "Silva",
        rut: "20123456-3",
        nacimiento: "1998-12-01",
        email: "daniela.contreras@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Inventario, control de stock",
        despedido: false,
      },
      {
        nombres: "Ricardo Antonio",
        apellidoPaterno: "Vega",
        apellidoMaterno: "Castro",
        rut: "14987654-5",
        nacimiento: "1970-07-19",
        email: "ricardo.vega@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Seguridad, supervisión",
        despedido: false,
      },
      {
        nombres: "Valentina Ignacia",
        apellidoPaterno: "Ríos",
        apellidoMaterno: "Torres",
        rut: "21456789-6",
        nacimiento: "2000-03-25",
        email: "valentina.rios@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Caja, atención de público",
        despedido: false,
      },
      {
        nombres: "Sebastián Eduardo",
        apellidoPaterno: "Fuentes",
        apellidoMaterno: "Navarro",
        rut: "18222333-4",
        nacimiento: "1988-05-14",
        email: "sebastian.fuentes@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Transporte, distribución",
        despedido: false,
      },
      {
        nombres: "Paula Andrea",
        apellidoPaterno: "Vargas",
        apellidoMaterno: "Espinoza",
        rut: "19111222-5",
        nacimiento: "1992-08-30",
        email: "paula.vargas@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Administración, archivo",
        despedido: false,
      },
    ];

    const entidadesTrabajadores = trabajadoresData.map(t => trabajadoresRepository.create(t));
    await trabajadoresRepository.save(entidadesTrabajadores);

    console.log("* => Trabajadores creados exitosamente");
  } catch (error) {
    console.error("Error al crear trabajadores:", error);
  }
}

export { createUsers, createClientes, createRoles, createTrabajadores, createContactos, createSedes };