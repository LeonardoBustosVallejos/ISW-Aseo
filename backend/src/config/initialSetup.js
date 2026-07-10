"use strict";
import User from "../entity/user.entity.js";
import Rol from "../entity/rol.entity.js";
import Cliente from "../entity/cliente.entity.js";
import Contacto from "../entity/contacto.entity.js";
import Sede from "../entity/sede.entity.js";
import Item from "../entity/item.entity.js";
import Solicitud from "../entity/solicitud.entity.js";
import Trabajador from "../entity/trabajador.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { HOST, PORT } from "./configEnv.js";
import ActivoFijo from "../entity/activofijo.entity.js";
import { registrarNuevoActivo } from "../services/activofijo.service.js";

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
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Damián Alejandro Soto Jimenez",
          rut: "22419881-4",
          email: "administrador2@gmail.com",
          password: await encryptPassword("admin1234"),
          rol: 1,
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
        telefono: "+56299964965",
        email: "carlos.munoz@gmail.cl",
        rol: 4, 
        sexo: "M",
        competencias: "Limpieza de oficinas, manejo de insumos",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Carlos_Andres.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Carlos_Andres.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Carlos_Andres.pdf`,
      },
      {
        nombres: "María Fernanda",
        apellidoPaterno: "Pérez",
        apellidoMaterno: "Soto",
        rut: "18765432-1",
        nacimiento: "1990-11-03",
        telefono: "+56981411184",
        email: "maria.soto@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Atención al cliente, orden de bodega",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Maria_Fernanda.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Maria_Fernanda.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Maria_Fernanda.pdf`,
      },
      {
        nombres: "Luis Alberto",
        apellidoPaterno: "González",
        apellidoMaterno: "Díaz",
        rut: "16543210-7",
        nacimiento: "1978-06-22",
        telefono: "+56254435101",
        email: "luis.gonzalez@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Manejo de maquinaria, logística",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Luis_Alberto.png`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Luis_Alberto.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Luis_Alberto.pdf`,
      },
      {
        nombres: "Camila Andrea",
        apellidoPaterno: "Herrera",
        apellidoMaterno: "López",
        rut: "19876543-2",
        nacimiento: "1995-09-10",
        telefono: "+56291980379",
        email: "camila.herrera@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Recepción, atención telefónica",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Camila_Andrea.png`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Camila_Andrea.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Camila_Andrea.pdf`,
      },
      {
        nombres: "Jorge Luis",
        apellidoPaterno: "Araya",
        apellidoMaterno: "Morales",
        rut: "15234567-8",
        nacimiento: "1975-02-28",
        telefono: "+56566647161",
        email: "jorge.araya@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Mantención, electricidad básica",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Jorge_Luis.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Jorge_Luis.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Jorge_Luis.pdf`,
      },
      {
        nombres: "Daniela Paz",
        apellidoPaterno: "Contreras",
        apellidoMaterno: "Silva",
        rut: "20123456-3",
        nacimiento: "1998-12-01",
        telefono: "+56739814624",
        email: "daniela.contreras@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Inventario, control de stock",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Daniela_Paz.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Daniela_Paz.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Daniela_Paz.pdf`,
      },
      {
        nombres: "Ricardo Antonio",
        apellidoPaterno: "Vega",
        apellidoMaterno: "Castro",
        rut: "14987654-5",
        nacimiento: "1970-07-19",
        telefono: "+56680393753",
        email: "ricardo.vega@gmail.cl",
        rol: 4,
        sexo: "M",
        competencias: "Seguridad, supervisión",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Ricardo_Antonio.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Ricardo_Antonio.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Ricardo_Antonio.pdf`,
      },
      {
        nombres: "Valentina Ignacia",
        apellidoPaterno: "Ríos",
        apellidoMaterno: "Torres",
        rut: "21456789-6",
        nacimiento: "2000-03-25",
        telefono: "+56598289467",
        email: "valentina.rios@gmail.cl",
        rol: 4,
        sexo: "F",
        competencias: "Caja, atención de público",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Valentina_Ignacia.png`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Valentina_Ignacia.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Valentina_Ignacia.pdf`,
      },
      {
        nombres: "Sebastián Eduardo",
        apellidoPaterno: "Fuentes",
        apellidoMaterno: "Navarro",
        rut: "18222333-4",
        nacimiento: "1988-05-14",
        telefono: "+56764254517",
        email: "sebastian.fuentes@gmail.cl",
        rol: 3,
        sexo: "M",
        competencias: "Transporte, distribución",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Sebastian_Eduardo.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Sebastian_Eduardo.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Sebastian_Eduardo.pdf`,
      },
      {
        nombres: "Paula Andrea",
        apellidoPaterno: "Vargas",
        apellidoMaterno: "Espinoza",
        rut: "19111222-5",
        nacimiento: "1992-08-30",
        telefono: "+56431001287",
        email: "paula.vargas@gmail.com",
        rol: 3,
        sexo: "F",
        competencias: "Administración, archivo",
        despedido: false,
        foto_url: `http://${HOST}:${PORT}/uploads/fotos/Paula_Andrea.jpg`,
        cv_url: `http://${HOST}:${PORT}/uploads/cvs/Paula_Andrea.pdf`,
        antecedentes_url: `http://${HOST}:${PORT}/uploads/antecedentes/Paula_Andrea.pdf`,
        password: await encryptPassword("supervisor1234")
      },
    ];

    const entidadesTrabajadores = trabajadoresData.map(t => trabajadoresRepository.create(t));
    await trabajadoresRepository.save(entidadesTrabajadores);

    console.log("* => Trabajadores creados exitosamente");
  } catch (error) {
    console.error("Error al crear trabajadores:", error);
  }
}

async function createItems() {
  try {
    const itemsRepository = AppDataSource.getRepository("Item");

    const count = await itemsRepository.count();
    if (count > 0) return;

    const items = [
      {
        nombre: "Máquina pulidora Bauker 110W",
        codigo: "F-MP-B110W",
        tipo: "Fijo",
        descripcion: "La Pulidora para Mármol Trifásica MEC7-CE es una máquina profesional diseñada para pulir y abrillantar pavimentos de mármol, terrazo, cemento y superficies similares. Su alimentación trifásica, velocidad fija y estructura robusta permiten trabajar con estabilidad, precisión y buen rendimiento en faenas determinación y mantención de pisos.",
        disponibilidadActual: 9,
        disponibilidadTotal: 10
      },
      {
        nombre: "Pack de 12 detergente OMO",
        codigo: "C-PD12-O",
        tipo: "Consumible",
        descripcion: "Fórmula líquida concentrada que limpia en profundidad y rinde más por lavado, en pack de botella y doypack.",
        disponibilidadActual: 43,
        disponibilidadTotal: 50
      },
      {
        nombre: "Carro utensilios con tapa Abrillantadora",
        codigo: "F-CUT-A",
        tipo: "Fijo",
        descripcion: "Optimiza la organización y movilidad en tus espacios de limpieza con nuestro versátil carro porta útiles en color gris.** Diseñado para facilitar el almacenamiento y transporte de herramientas, este carro es ideal tanto para entornos comerciales como residenciales donde la eficiencia es clave.",
        disponibilidadActual: 8,
        disponibilidadTotal: 15
      },
      {
        nombre: "2 Trapeadores Kleine Wolge",
        codigo: "C-T2-KW",
        tipo: "Consumible",
        descripcion: "Dale un giro a tu limpieza con el Balde Pedal + Mopa Easy Wring. Olvídate del esfuerzo y disfruta de pisos impecables con su sistema de fácil escurrido, que te permite controlar la humedad con solo presionar un pedal. Su mopa de microfibra limpia eficazmente distintos tipos de pisos, incluso paredes y vidrios. ¡Limpieza eficiente y sin goteos!",
        disponibilidadActual: 19,
        disponibilidadTotal: 30
      },
      {
        nombre: "Contenedor de basura 1100 Litros Bioplastic",
        codigo: "F-CB-B",
        tipo: "Fijo",
        descripcion: "Basurero Domiciliario de 120 litros con ruedas – Fabricación chilena. Fabricado en polietileno con filtro UV. Ideal para uso domiciliario, condominios y pequeñas industrias. Cumple con la Norma Europea EN 840.",
        disponibilidadActual: 10,
        disponibilidadTotal: 20
      },
    ];

    await itemsRepository.save(items);

    console.log("* => Items creados exitosamente");

  } catch (error) {
    console.error("Error al crear items", error);
  }
}

async function createSolicitudes() {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const count = await solicitudRepository.count();
    if (count > 0) return;

    const solicitudesData = [
      {
        cantidad_solicitud: 5,
        id_item_solicitud: 1,
        id_solicitante: 3,
        id_administrador_solicitud: 1,
        id_sede_solicitud: 1,
        detalle_solicitud: "Solicitud de pulidora para la sede principal.",
        estado_solicitud: "Pendiente",
      },
      {
        cantidad_solicitud: 8,
        id_item_solicitud: 2,
        id_solicitante: 3,
        id_administrador_solicitud: 1,
        id_sede_solicitud: 2,
        detalle_solicitud: "Solicitud de detergente para la sucursal del sur.",
        estado_solicitud: "Pendiente",
      },
      {
        cantidad_solicitud: 3,
        id_item_solicitud: 3,
        id_solicitante: 3,
        id_administrador_solicitud: 8,
        id_sede_solicitud: 1,
        detalle_solicitud: "Solicitud de carro de utensilios para la sede principal.",
        estado_solicitud: "Pendiente",
      },
      {
        cantidad_solicitud: 2,
        id_item_solicitud: 2,
        id_solicitante: 10,
        id_administrador_solicitud: 1,
        id_sede_solicitud: 1,
        detalle_solicitud: "Solicitud de carro de utensilios para la sede principal.",
        estado_solicitud: "Pendiente",
      },
    ];

    await solicitudRepository.save(solicitudRepository.create(solicitudesData));
    console.log("* => Solicitudes creadas exitosamente");
  } catch (error) {
    console.error("Error al crear solicitudes:", error);
  }
}

async function createActivosFijos() {
  try {
    const activoRepository = AppDataSource.getRepository(ActivoFijo); 
    const count = await activoRepository.count();
    if (count > 0) return;

    const activosData = [
      {
        codigo_inventario: "LBL-001",
        nombre: "Lavadora Industrial 20kg",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "LBL-002",
        nombre: "Lavadora Industrial 20kg",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "LBL-003",
        nombre: "Lavadora Industrial 20kg",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "LBL-004",
        nombre: "Lavadora Industrial 20kg",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "HLR-001",
        nombre: "Carro Estrujador de 20Lts",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "HLR-002",
        nombre: "Carro Estrujador de 20Lts",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "HLR-003",
        nombre: "Carro Estrujador de 20Lts",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
      {
        codigo_inventario: "HLR-004",
        nombre: "Carro Estrujador de 20Lts",
        estado: "Buen Estado",
        recepcion_confirmada: false,
        fecha_ingreso: "2026-07-10"
      },
    ];

    await activoRepository.save(activoRepository.create(activosData));
    console.log("* => Activos Fijos creados exitosamente");

  } catch (error) {
    console.error("Error al crear activos fijos", error);
  }
}

export { createUsers, createClientes, createRoles, createTrabajadores, createContactos, createSedes, createItems, createSolicitudes, createActivosFijos};