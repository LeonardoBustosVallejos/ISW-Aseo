"use strict";
import User from "../entity/user.entity.js";
import Trabajador from "../entity/trabajador.entity.js"
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count();
    if (count > 0) return;

    await Promise.all([
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Salazar Jara",
          rut: "21.308.770-3",
          email: "administrador@gmail.cl",
          password: await encryptPassword("admin1234"),
          rol: "administrador",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Sebastián Ampuero Belmar",
          rut: "21.151.897-9",
          email: "usuario1@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        })
      ),
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Alexander Benjamín Marcelo Carrasco Fuentes",
            rut: "20.630.735-8",
            email: "usuario2@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "usuario",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Pablo Andrés Castillo Fernández",
          rut: "20.738.450-K",
          email: "usuario3@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Felipe Andrés Henríquez Zapata",
          rut: "20.976.635-3",
          email: "usuario4@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Meza Ortega",
          rut: "21.172.447-1",
          email: "usuario5@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Juan Pablo Rosas Martin",
          rut: "20.738.415-1",
          email: "usuario6@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
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

    const trabajadores = [
      {
        nombreCompleto: "Carlos Andrés Muñoz Rojas",
        rut: "17.345.221-9",
        nacimiento: "1982-04-15",
        email: "carlos.munoz@gmail.cl",
        rol: "trabajador",
        sexo: "M",
        grupo: null,
        antecedentes: null,
        competencias: "Limpieza de oficinas, manejo de insumos",
        despedido: false,
      },
      {
        nombreCompleto: "María Fernanda Soto Pérez",
        rut: "18.765.432-1",
        nacimiento: "1990-11-03",
        email: "maria.soto@gmail.cl",
        rol: "trabajador",
        sexo: "F",
        grupo: null,
        antecedentes: null,
        competencias: "Atención al cliente, orden de bodega",
        despedido: false,
      },
      {
        nombreCompleto: "Luis Alberto González Díaz",
        rut: "16.543.210-7",
        nacimiento: "1978-06-22",
        email: "luis.gonzalez@gmail.cl",
        rol: "trabajador",
        sexo: "M",
        grupo: null,
        antecedentes: null,
        competencias: "Manejo de maquinaria, logística",
        despedido: false,
      },
      {
        nombreCompleto: "Camila Andrea Herrera López",
        rut: "19.876.543-2",
        nacimiento: "1995-09-10",
        email: "camila.herrera@gmail.cl",
        rol: "trabajador",
        sexo: "F",
        grupo: null,
        antecedentes: null,
        competencias: "Recepción, atención telefónica",
        despedido: false,
      },
      {
        nombreCompleto: "Jorge Luis Araya Morales",
        rut: "15.234.567-8",
        nacimiento: "1975-02-28",
        email: "jorge.araya@gmail.cl",
        rol: "trabajador",
        sexo: "M",
        grupo: null,
        antecedentes: null,
        competencias: "Mantención, electricidad básica",
        despedido: false,
      },
      {
        nombreCompleto: "Daniela Paz Contreras Silva",
        rut: "20.123.456-3",
        nacimiento: "1998-12-01",
        email: "daniela.contreras@gmail.cl",
        rol: "trabajador",
        sexo: "F",
        grupo: null,
        antecedentes: null,
        competencias: "Inventario, control de stock",
        despedido: false,
      },
      {
        nombreCompleto: "Ricardo Antonio Vega Castro",
        rut: "14.987.654-5",
        nacimiento: "1970-07-19",
        email: "ricardo.vega@gmail.cl",
        rol: "trabajador",
        sexo: "M",
        grupo: null,
        antecedentes: null,
        competencias: "Seguridad, supervisión",
        despedido: false,
      },
      {
        nombreCompleto: "Valentina Ignacia Ríos Torres",
        rut: "21.456.789-6",
        nacimiento: "2000-03-25",
        email: "valentina.rios@gmail.cl",
        rol: "trabajador",
        sexo: "F",
        grupo: null,
        antecedentes: null,
        competencias: "Caja, atención de público",
        despedido: false,
      },
      {
        nombreCompleto: "Sebastián Eduardo Fuentes Navarro",
        rut: "18.222.333-4",
        nacimiento: "1988-05-14",
        email: "sebastian.fuentes@gmail.cl",
        rol: "trabajador",
        sexo: "M",
        grupo: null,
        antecedentes: null,
        competencias: "Transporte, distribución",
        despedido: false,
      },
      {
        nombreCompleto: "Paula Andrea Vargas Espinoza",
        rut: "19.111.222-5",
        nacimiento: "1992-08-30",
        email: "paula.vargas@gmail.cl",
        rol: "trabajador",
        sexo: "F",
        grupo: null,
        antecedentes: null,
        competencias: "Administración, archivo",
        despedido: false,
      },
    ];

    await trabajadoresRepository.save(trabajadores);

    console.log("* => Trabajadores creados exitosamente");
  } catch (error) {
    console.error("Error al crear trabajadores:", error);
  }
}
export { createUsers, createTrabajadores };