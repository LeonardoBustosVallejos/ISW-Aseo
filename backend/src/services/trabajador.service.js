"use strict";
import { Brackets } from "typeorm";
import Rut from "rutjs";
import { AppDataSource } from "../config/configDb.js";
import Trabajador from "../entity/trabajador.entity.js";
import Contacto from "../entity/contacto.entity.js";
import { getContactoByService } from "./cliente.service.js";
import TrabajadorHistorialSchema from "../entity/trabajadorHistorial.entity.js";
import Sede from "../entity/sede.entity.js"
import TrabajadoresGruposSchema from "../entity/trabajadoresGrupos.entity.js";

const formatDateOnly = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getDateYearsAgo = (years) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - Number(years));
    return formatDateOnly(date);
};

export async function getTrabajadoresService({
    page,
    limit,
    search = "",
    sexo = "",
    edadMin,
    edadMax,
    rol = "",
    competencias,
    estado = "activos"
}) {
    try {

        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const skip = (page - 1) * limit;
        const terminoBusqueda = search.trim();

        if (edadMin !== undefined && edadMax !== undefined && Number(edadMin) > Number(edadMax)) {
            return [null, "El rango etario no es válido: la edad mínima no puede ser mayor que la edad máxima."];
        }

        const query = TrabajadoresRepository.createQueryBuilder("trabajador")
            .leftJoinAndSelect("trabajador.rol", "rol")
            .leftJoinAndSelect("trabajador.competencias", "competencias")
            .leftJoinAndSelect("trabajador.grupoAsignado", "grupoAsignado")
            .leftJoinAndSelect("trabajador.gruposSupervisados", "gruposSupervisados")
            .leftJoinAndSelect("trabajador.historialDesvinculaciones", "historialDesvinculaciones")
            .distinct(true)
            .orderBy("trabajador.id", "ASC")
            .skip(skip)
            .take(limit);

        if (estado !== "todos") {
            query.andWhere("trabajador.despedido = :despedido", {
                despedido: estado === "despedidos"
            });
        }

        if (terminoBusqueda) {
            const searchValue = `%${terminoBusqueda}%`;
            query.andWhere(new Brackets((qb) => {
                qb.where("trabajador.nombres ILIKE :search", { search: searchValue })
                    .orWhere("trabajador.apellidoPaterno ILIKE :search", { search: searchValue })
                    .orWhere("trabajador.apellidoMaterno ILIKE :search", { search: searchValue })
                    .orWhere("trabajador.rut ILIKE :search", { search: searchValue })
                    .orWhere("trabajador.email ILIKE :search", { search: searchValue });
            }));
        }

        if (sexo) {
            query.andWhere("trabajador.sexo = :sexo", { sexo });
        }

        if (rol) {
            query.andWhere("rol.nombre = :rol", { rol });
        }

        if (competencias) {
            if (Array.isArray(competencias)) {
                query.andWhere("competencias.id IN (:...competencias)", { competencias });
            } else {
                query.andWhere("competencias.id = :competencias", { competencias });
            }
        }

        if (edadMin !== undefined && edadMin !== "") {
            query.andWhere("trabajador.nacimiento <= :fechaMax", {
                fechaMax: getDateYearsAgo(edadMin)
            });
        }

        if (edadMax !== undefined && edadMax !== "") {
            query.andWhere("trabajador.nacimiento >= :fechaMin", {
                fechaMin: getDateYearsAgo(edadMax)
            });
        }

        const [trabajadores, totalItems] = await query.getManyAndCount();

        const totalPages = Math.max(1, Math.ceil(totalItems / limit));

        const payload = {
            trabajadores,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                perPage: limit
            }
        };

        return [payload, null];
    }
    catch (error) {
        console.error("Error al obtener a los trabajadores:", error);
        return [null, error.message || "Error interno del servidor"];
    }
}

export async function getTrabajadorService(id) {
    try {
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajador = await TrabajadoresRepository.findOne({
            where:
                { id: Number(id) },
                relations: ["rol", 
                            "competencias", 
                            "grupoAsignado", 
                            "gruposSupervisados", 
                            "gruposSupervisados",
                            "historialDesvinculaciones"],
        });

        if (!trabajador) return [null, "No se encontró el trabajador"];

        return [trabajador, null];
    }
    catch (error) {
        console.error("Error al obtener el trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

/**
 * Busqueda estricta OR para obtener un trabajador por id, rut o email. 
 * Se puede usar cualquiera de estos criterios de búsqueda, pero se recomienda usar el id para una búsqueda más rápida y precisa.
 * @param data datos de búsqueda, debe contener al menos uno de los siguientes: id, rut o email
 * @returns trabajador encontrado o mensaje de error si no se encuentra o si no se proporcionó un criterio de búsqueda válido
 */
export async function getORTrabajadorService(data) {
    try {
        const { id, rut, email } = data;

        if (!id && !rut && !email) return [null, "Debe proporcionar al menos un criterio de búsqueda"]

        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);

        const where = [];
        if (id) where.push({ id });
        if (rut) where.push({ rut });
        if (email) where.push({ email })

        const trabajador = await TrabajadoresRepository.findOne({ where });

        if (!trabajador) return [null, "No se encontró el trabajador"];

        return [trabajador, null];
    }
    catch (error) {
        console.error("Error al obtener el trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function updateTrabajadorService(id, body) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const contactoRepository = AppDataSource.getRepository(Contacto);
        const gruposRepository = AppDataSource.getRepository(TrabajadoresGruposSchema);
        const itemRepository = AppDataSource.getRepository("Item");
        const rolRepository = AppDataSource.getRepository("Rol");

        const trabajadorFound = await trabajadoresRepository.findOne({
            where: { id: Number(id) },
            relations: ["competencias", 
                        "rol", 
                        "grupoAsignado",
                        "gruposSupervisados"]
        });
        if (!trabajadorFound) return [null, "Trabajador no encontrado"];

        //verificar que el correo electrónico no esté registrado
        if (body.email) {
            const existingEmail = await trabajadoresRepository.findOne(
                { where: [{ email: body.email }] })
            const existingContactoEmail = await contactoRepository.findOne(
                { where: [{ email: body.email }] })
            if (existingEmail || existingContactoEmail) {
                return [null, "Email ya en uso"]};

            trabajadorFound.email = body.email;
        }
     
        // Verifica que si era supervisor no puede ser un Trabajador mientras tenga grupos asignados
        if (body.rol) {
            const rolObj = await rolRepository.findOne({ where: { id: Number(body.rol) } });
            if (!rolObj) return [null, "El rol especificado no es válido"];

            const esSupervisorActual = trabajadorFound.rol && trabajadorFound.rol.id === 3;
            const vaASerTrabajador = rolObj.id === 4;
            const tieneGruposACargo = trabajadorFound.gruposSupervisados && trabajadorFound.gruposSupervisados.length > 0;

            if (esSupervisorActual && vaASerTrabajador && tieneGruposACargo) {
                return [
                    null, 
                    `No se puede cambiar el rol a Trabajador porque actualmente es supervisor de ${trabajadorFound.gruposSupervisados.length} grupo(s). Primero debes asignar otro supervisor a esos grupos.`
                ];
            }

            if (rolObj.id === 1 || rolObj.id === 2){
                return [
                    null,
                    `Un empleado no puede cambiar su rol a Administrador o Cliente.`
                ];
            }

            trabajadorFound.rol = rolObj;
            }

        if (body.telefono) {
            const existingTelefono = await trabajadoresRepository.findOne({ 
                where: { telefono: body.telefono, id: id } });
            if (existingTelefono) {
                return [null, "El teléfono ya se encuentra en uso"];}
            trabajadorFound.telefono = body.telefono;
        }
   
        if (Object.prototype.hasOwnProperty.call(body, "grupo_id")) {
            const sedeRepository = AppDataSource.getRepository(Sede);

            if (trabajadorFound.grupoAsignado && trabajadorFound.grupoAsignado.sedeAsignada) {
                const sedeVieja = trabajadorFound.grupoAsignado.sedeAsignada;
                sedeVieja.personalAsignado = Math.max(0, sedeVieja.personalAsignado - 1);
                await sedeRepository.save(sedeVieja);
            }

            if (body.grupo_id === null || body.grupo_id === "null" || body.grupo_id === "") {
                trabajadorFound.grupoAsignado = null;
            } else {
                const grupoObj = await gruposRepository.findOneBy({ grupo_id: Number(body.grupo_id) });
                if (!grupoObj) return [null, "Grupo no encontrado"];
                
                trabajadorFound.grupoAsignado = grupoObj;

                if (grupoObj.sedeAsignada) {
                    const sedeNueva = grupoObj.sedeAsignada;
                    sedeNueva.personalAsignado = (sedeNueva.personalAsignado || 0) + 1;
                    await sedeRepository.save(sedeNueva);
                }
            }
        }

        if (body.competenciasIds) {
            const nuevosItems = await itemRepository.findByIds(body.competenciasIds);
            trabajadorFound.competencias = nuevosItems;
        }
        if (body.foto_url) trabajadorFound.foto_url = body.foto_url;
        if (body.antecedentes_url) trabajadorFound.antecedentes_url = body.antecedentes_url;
        if (body.cv_url) trabajadorFound.cv_url = body.cv_url;

        trabajadorFound.updatedAt = new Date();

        const saved = await trabajadoresRepository.save(trabajadorFound);
        return [saved, null]

    } catch (error) {
        console.error("Error al modificar un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function despidoTrabajadorService(id, data) {
    try {
        const { motivo, archivo_url } = data;

        if (!motivo || !motivo.trim()) {
            return [null, "Debe indicar el motivo de su desvinculación"];
        }

        const trabajadoresRepoGlobal = AppDataSource.getRepository(Trabajador);
        const supervisorCheck = await trabajadoresRepoGlobal.findOne({
            where: { id: Number(id) },
            relations: ["gruposSupervisados"]
        });

        if (supervisorCheck && supervisorCheck.gruposSupervisados && supervisorCheck.gruposSupervisados.length > 0) {
            const nombresGrupos = supervisorCheck.gruposSupervisados.map(g => `'${g.nombre}'`).join(", ");
            return [
                null, 
                `No se puede despedir al supervisor porque actualmente tiene a su cargo los siguientes grupos: ${nombresGrupos}. Primero reasigne estos grupos a otro supervisor.`
            ];
        }

        return await AppDataSource.transaction(async (manager) => {
            const trabajadoresRepository = manager.getRepository(Trabajador);
            const historialRepository = manager.getRepository(TrabajadorHistorialSchema);
            const sedeRepository = manager.getRepository(Sede);

            const trabajadorFound = await trabajadoresRepository.findOne({
                where: { id: Number(id), despedido: false },
                relations: [
                    "grupoAsignado", 
                    "grupoAsignado.sedeAsignada"
                ]
            });
            
            if (!trabajadorFound) return [null, "Trabajador activo no encontrado"];

            if (trabajadorFound.grupoAsignado && trabajadorFound.grupoAsignado.sedeAsignada) {
                const sede = trabajadorFound.grupoAsignado.sedeAsignada;
                sede.personalAsignado = Math.max(0, sede.personalAsignado - 1);
                await sedeRepository.save(sede);
            }

            trabajadorFound.grupoAsignado = null;
            trabajadorFound.despedido = true;
            trabajadorFound.updatedAt = new Date();
            
            await trabajadoresRepository.save(trabajadorFound);

            const historial = historialRepository.create({
                motivo: motivo.trim(),
                fechaDesvinculacion: new Date(),
                archivo_url: archivo_url,
                trabajador: trabajadorFound,
            });
            await historialRepository.save(historial);

            const trabajadorData = await trabajadoresRepository.findOne({
                where: { id: trabajadorFound.id },
                relations: ["historialDesvinculaciones"],
            });

            return [trabajadorData, null];
        });
    } catch (error) {
        console.error("Error real en la base de datos al despedir:", error);
        return [null, "Error interno del servidor al procesar el despido."];
    }
}

export async function recontratarTrabajadorService(id) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        
        const trabajadorFound = await trabajadoresRepository.findOne({
            where: { id: Number(id), despedido: true },
        });
        if (!trabajadorFound) return [null, "Trabajador despedido no encontrado"];

        trabajadorFound.despedido = false;
        trabajadorFound.updatedAt = new Date();

        const saved = await trabajadoresRepository.save(trabajadorFound);
        return [saved, null];

    } catch (error) {
        console.error("Error al recontratar un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createTrabajadoresService(trabajadoresData) {
    try {
        const { nombres,
            apellidoPaterno,
            apellidoMaterno,
            nacimiento,
            telefono,
            rut,
            email,
            grupo_id,
            rol,
            sexo,
            nombreCompleto,
            despedido,
            foto_url,
            cv_url,
            antecedentes_url,
            competenciasIds } = trabajadoresData;

        let rutSinPuntos = rut;

        if(rut) {
            const rutObjt = new Rut(rut);
            rutSinPuntos = rutObjt.getNiceRut(false);
        }
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const contactoRepository = AppDataSource.getRepository(Contacto);
        const gruposRepository = AppDataSource.getRepository(TrabajadoresGruposSchema);
        const rolRepository = AppDataSource.getRepository("Rol");
        const itemRepository = AppDataSource.getRepository("Item");
        

        // verificar que el rol exista en la base de datos antes de seguir
        const rolObj = await rolRepository.findOne({ where: { nombre: rol } });
        if (!rolObj) return [null, "El rol especificado no es válido en el sistema."];
        
        //verificar que el rut no esté ya registrado
        const existingRut = await TrabajadoresRepository.findOne({ where: { rut: rutSinPuntos } })
        const existingContacto = await contactoRepository.findOne({ where: { contacto_rut: rutSinPuntos } })
        if (existingContacto || existingRut) return [null, "Rut ya registrado previamente"]

        //verificar que el teléfono no esté registrado
        const existingTelefono = await TrabajadoresRepository.findOne({ where: { telefono: telefono } });
        if (existingTelefono) return [null, "Telefono ya en uso"]

        //verificar que el correo electrónico no esté registrado
        const existingEmail = await TrabajadoresRepository.findOne({ where: [{ email: email }] })
        const existingContactoEmail = await contactoRepository.findOne({ where: [{ email: email }] })
        if (existingEmail || existingContactoEmail) return [null, "Email ya en uso"]

        // verificar si los items existen
        let asignarItems = [];
        if (competenciasIds && competenciasIds.length > 0) {
            asignarItems = await itemRepository.findByIds(competenciasIds);

            if (asignarItems.length !== competenciasIds.length) {
                return [null, "Una o más competencias especificadas no existen en el sistema."];
            }
        }

        const newTrabajador = TrabajadoresRepository.create({
            nombres,
            apellidoPaterno,
            apellidoMaterno,
            nacimiento,
            rut: rutSinPuntos,
            telefono,
            email,
            rol: rolObj,
            sexo,
            nombreCompleto: `${trabajadoresData.nombres} ${trabajadoresData.apellidoPaterno} ${trabajadoresData.apellidoMaterno}`,
            despedido: despedido ?? false,
            foto_url: foto_url ?? null,
            cv_url: cv_url || null,
            antecedentes_url: antecedentes_url || null,
            competencias: asignarItems
        });
        
        if (grupo_id) {
            const grupoObj = await gruposRepository.findOneBy({
                grupo_id: Number(grupo_id)
            });
            if (!grupoObj) {
                return [null, "Grupo no encontrado"];
            }
            newTrabajador.grupoAsignado = grupoObj;
        }
       
        const trabajadorGuardado = await TrabajadoresRepository.save(newTrabajador);
        return [trabajadorGuardado, null];
    }
    catch (error) {
        return [null, error.message];
    }
}

export async function createGrupoService({ nombre, sede_id, supervisor_id, miembros: miembros_ids }) {
    try {
        const sedeRepo = AppDataSource.getRepository(Sede);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);

        const cantidadNuevosMiembros = miembros_ids.length;

        const grupoExistente = await gruposRepo.findOneBy({ nombre: nombre.trim() });
        if (grupoExistente) {
            return [null, `Ya existe un grupo con el nombre '${nombre}'.`];
        }

        const sede = await sedeRepo.findOneBy({ sede_id: Number(sede_id) });
        if (!sede) {
            return [null, "Sede no encontrada"];
        }

        const supervisor = await trabajadorRepo.findOne({
            where: { id: Number(supervisor_id) },
            relations: ["rol"]
        });
        if (!supervisor || supervisor.despedido) {
            return [null, "El supervisor seleccionado no está activo."];
        }
        if (supervisor.rol.id !== 3) {
            return [null, "El trabajador seleccionado no posee el rol de 'Supervisor'."];
        }

        const gruposDelSupervisor = await gruposRepo.countBy({
            supervisorAsignado: { id: supervisor.id }
        });
        if (gruposDelSupervisor >= 6) {
            return [
                null, 
                `El supervisor ${supervisor.nombres} ${supervisor.apellidoMaterno} ya tiene a cargo el límite máximo de 6 grupos.`
            ];
        }

        const miembros = await trabajadorRepo.find({
            where: miembros_ids.map((id) => ({ id: Number(id) })),
            relations: ["grupoAsignado"]
        });

        if (miembros.length !== miembros_ids.length) {
            return [null, "Uno o más miembros seleccionados no existen."];
        }
        if (miembros.some(m => m.despedido)) {
            return [null, "No se puede asignar un miembro que se encuentra despedido."];
        }

        for (const m of miembros) {
            if (m.grupoAsignado) {
                return [
                    null, 
                    `El trabajador ${m.nombres} ${m.apellidoMaterno} ya pertenece al grupo '${m.grupoAsignado.nombre}'.`
                ];
            }
        }

        if (sede.personalAsignado + cantidadNuevosMiembros > sede.personalSolicitado) {
            return [
                null, 
                `Cupos excedidos en la sede '${sede.nombre_sede}'. Solicitados: ${sede.personalSolicitado}, Asignados: ${sede.personalAsignado}. Intentas ingresar ${cantidadNuevosMiembros}.`
            ];
        }

        return await AppDataSource.transaction(async (manager) => {
            const gruposRepoTx = manager.getRepository(TrabajadoresGruposSchema);
            const sedeRepoTx = manager.getRepository(Sede); 

            const grupoToSave = gruposRepoTx.create({
                nombre: nombre.trim(),
                sedeAsignada: sede,
                supervisorAsignado: supervisor,
                miembros: miembros 
            });

            const savedGrupo = await gruposRepoTx.save(grupoToSave);

            for (const miembro of miembros) {
                miembro.grupoAsignado = savedGrupo;
            }
            await manager.save(Trabajador, miembros); 

            sede.personalAsignado += cantidadNuevosMiembros;
            await sedeRepoTx.save(sede);

            const grupoFull = await gruposRepoTx.findOne({
                where: { grupo_id: savedGrupo.grupo_id },
                relations: ["sedeAsignada", "supervisorAsignado", "miembros"],
            });

            return [grupoFull, null];
        });

    } catch (error) {
        console.error("Hubo un error al crear los grupos", error);
        return [null, "Error interno del servidor al procesar el grupo."];
    }
}
    
export async function getGruposService({ page, limit }) {
    try {
        const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);
        const skip = (page - 1) * limit;

        const [grupos, totalItems] = await gruposRepo.findAndCount({
            relations: ["sedeAsignada", 
                        "supervisorAsignado", 
                        "miembros"],
            skip: skip,
            take: limit,
        });

        if (!grupos || grupos.length === 0) return [null, "No hay grupos"];

        const totalPages = Math.ceil(totalItems / limit);

        const payload = {
            grupos,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                perPage: limit
            }
        };

        return [payload, null];
    }
    catch (error) {
        console.error("Error al obtener los grupos:", error);
        return [null, error.message || "Error interno del servidor"];
    }
}

export async function getGrupoService(grupo_id) {
  try {
    const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);
    
    // Buscamos solo el que coincida con el ID y traemos sus relaciones
    const grupo = await gruposRepo.findOne({
      where: { grupo_id },
      relations: ["sedeAsignada", "supervisorAsignado", "miembros"],
    });

    if (!grupo) return [null, "El grupo solicitado no existe"];
    return [grupo, null];
  } catch (error) {
    console.error("Error al obtener el grupo por ID:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateGrupoService(grupo_id, { nombre, supervisor_id, miembros_ids }) {
  try {
    const trabajadorRepo = AppDataSource.getRepository(Trabajador);
    const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);

    const grupoExistente = await gruposRepo.findOne({
      where: { grupo_id },
      relations: ["sedeAsignada", "supervisorAsignado", "miembros"]
    });
    if (!grupoExistente) return [null, "Grupo no encontrado"];

    let nuevoSupervisor = grupoExistente.supervisorAsignado;
    if (supervisor_id && Number(supervisor_id) !== grupoExistente.supervisorAsignado?.id) {
      nuevoSupervisor = await trabajadorRepo.findOne({
        where: { id: Number(supervisor_id) },
        relations: ["rol"]
      });
      if (!nuevoSupervisor || nuevoSupervisor.despedido) return [null, "El supervisor seleccionado no está activo."];
      if (nuevoSupervisor.rol?.id !== 3) {
        return [null, "El trabajador seleccionado no cuenta con el rol de 'Supervisor'."];
      }

      const gruposDelSupervisor = await gruposRepo.count({
        where: {
          supervisorAsignado: { id: nuevoSupervisor.id },
          grupo_id: grupo_id
        }
      });
      if (gruposDelSupervisor >= 6) {
        return [null, `El supervisor ${nuevoSupervisor.nombres} ya está a cargo del límite máximo de 6 grupos.`];
      }
    }

    const nuevosMiembros = await trabajadorRepo.find({
      where: miembros_ids.map((id) => ({ id: Number(id) })),
      relations: ["grupoAsignado"]
    });

    if (nuevosMiembros.length !== miembros_ids.length) return [null, "Uno o más miembros especificados no existen."];
    if (nuevosMiembros.some(m => m.despedido)) return [null, "No se puede asignar un miembro que se encuentra despedido."];

    for (const nm of nuevosMiembros) {
      if (nm.grupoAsignado && nm.grupoAsignado.grupo_id !== grupo_id) {
        return [
          null, 
          `El trabajador ${nm.nombres} ${nm.apellidoPaterno} ya está asignado al grupo '${nm.grupoAsignado.nombre}'.`
        ];
      }
    }

    const sede = grupoExistente.sedeAsignada;
    const miembrosActualesCount = grupoExistente.miembros ? grupoExistente.miembros.length : 0;
    const miembrosNuevosCount = nuevosMiembros.length;
    const diferenciaNeta = miembrosNuevosCount - miembrosActualesCount;

    if (sede && diferenciaNeta > 0) {
      if (sede.personalAsignado + diferenciaNeta > sede.personalSolicitado) {
        return [
          null,
          `Cupos insuficientes en la sede '${sede.nombre_sede}'. Solicitados: ${sede.personalSolicitado}, Asignados: ${sede.personalAsignado}. Esta actualización requiere ${diferenciaNeta} cupos extra.`
        ];
      }
    }

    return await AppDataSource.transaction(async (manager) => {
      const trabajadorRepoTx = manager.getRepository(Trabajador);
      const gruposRepoTx = manager.getRepository(TrabajadoresGruposSchema);
      const sedeRepoTx = manager.getRepository("Sede");

      if (grupoExistente.miembros && grupoExistente.miembros.length > 0) {
        for (const miembroViejo of grupoExistente.miembros) {
          if (!miembros_ids.includes(miembroViejo.id)) {
            miembroViejo.grupoAsignado = null;
            await trabajadorRepoTx.save(miembroViejo);
          }
        }
      }

      grupoExistente.nombre = nombre ? nombre.trim() : grupoExistente.nombre;
      grupoExistente.supervisorAsignado = nuevoSupervisor;
      grupoExistente.miembros = nuevosMiembros;

      const grupoGuardado = await gruposRepoTx.save(grupoExistente);

      for (const nuevoMiembro of nuevosMiembros) {
        nuevoMiembro.grupoAsignado = grupoGuardado;
      }
      await trabajadorRepoTx.save(nuevosMiembros); // Guardado en bloque optimizado 🌟

      if (sede && diferenciaNeta !== 0) {
        sede.personalAsignado += diferenciaNeta;
        if (sede.personalAsignado < 0) sede.personalAsignado = nuevosMiembros.length;
        await sedeRepoTx.save(sede);
      }

      const grupoFull = await gruposRepoTx.findOne({
        where: { grupo_id: grupoGuardado.grupo_id },
        relations: ["sedeAsignada", "supervisorAsignado", "miembros"],
      });

      return [grupoFull, null];
    });

  } catch (error) {
    console.error("Hubo un error al actualizar el grupo:", error);
    return [null, "Error interno del servidor al modificar el grupo."];
  }
}

export async function deleteGrupoService(grupo_id) {
    try {
        const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);

        const grupo = await gruposRepo.findOne({
            where: { grupo_id: Number(grupo_id) },
            relations: ["sedeAsignada", "miembros"]
        });

        if (!grupo) return [null, "El grupo que intenta eliminar no existe."];

        await AppDataSource.transaction(async (manager) => {
            const trabajadoresRepoTx = manager.getRepository(Trabajador);
            const sedeRepoTx = manager.getRepository(Sede);
            const gruposRepoTx = manager.getRepository(TrabajadoresGruposSchema);

            if (grupo.miembros && grupo.miembros.length > 0) {
                const cantidadMiembrosALiberar = grupo.miembros.length;

                for (const miembro of grupo.miembros) {
                    miembro.grupoAsignado = null; // Quedan disponibles para otras cuadrillas
                }
                await manager.save(Trabajador, grupo.miembros);

                if (grupo.sedeAsignada) {
                    const sede = grupo.sedeAsignada;
                    sede.personalAsignado = Math.max(0, sede.personalAsignado - cantidadMiembrosALiberar);
                    await sedeRepoTx.save(sede);
                }
            }

            await gruposRepoTx.remove(grupo);
        });

        return ["Grupo eliminado correctamente", null];

    } catch (error) {
        console.error("Error al eliminar el grupo:", error);
        return [null, "Error interno del servidor al intentar disolver el grupo."];
    }
}