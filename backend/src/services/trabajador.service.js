"use strict";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import Trabajador from "../entity/trabajador.entity.js";
import Contacto from "../entity/contacto.entity.js";
import { getContactoByService } from "./cliente.service.js";
import TrabajadorHistorialSchema from "../entity/trabajadorHistorial.entity.js";
import Sede from "../entity/sede.entity.js"
import TrabajadoresGruposSchema from "../entity/trabajadoresGrupos.entity.js";

export async function getTrabajadoresService() {
    try {
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);

        const trabajadores = await TrabajadoresRepository.find({
            where: {
                despedido: false
            }
        });

        if (!trabajadores || trabajadores.length === 0) return [null, "No hay trabajadores"];

        return [trabajadores, null];
    }
    catch (error) {
        console.error("Error al obtener a los trabajadores:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getTrabajadorService(id) {
    try {
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajador = await TrabajadoresRepository.findOne({
            where:
                { id: Number(id) },
                relations: ["historialDesvinculaciones"],
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
        const gruposRepository = AppDataSource.getTreeRepository(TrabajadoresGruposSchema);

        const trabajadorFound = await trabajadoresRepository.findOne({
            where: { id: Number(id) },
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
        }

        if (body.nombreCompleto !== undefined) trabajadorFound.nombreCompleto = body.nombreCompleto;
        if (body.email !== undefined) trabajadorFound.email = body.email;
        if (body.rol !== undefined) trabajadorFound.rol = body.rol;
        if (body.competencias !== undefined) trabajadorFound.competencias = body.competencias;
        if (body.sexo !== undefined) trabajadorFound.sexo = body.sexo;
        trabajadorFound.updatedAt = new Date();

        if (Object.prototype.hasOwnProperty.call(body, "grupo_id")) {
            if (BeforeUpdate.grupo_id == null) {
                trabajadorFound.grupoAsignado = null;
            } else {
                const grupoObj = await gruposRepository.findOneBy({
                    grupo_id: Number(body.grupo_id)
                });

                if (!grupo) {
                    return [null, "Grupo no encontrado"];

                    trabajadorFound.grupoAsignado = grupoObj;
                }
            }
        }

        if (body.foto) {
        dataTrabajadorUpdate.fotoNombreOriginal = body.foto.original;
        dataTrabajadorUpdate.fotoNombreArchivo = body.foto.archivo;
        dataTrabajadorUpdate.fotoRuta = body.foto.ruta;
        dataTrabajadorUpdate.fotoMimeType = body.foto.mime;
        dataTrabajadorUpdate.fotoPeso = body.foto.peso;
        }

        if (body.cv) {
        dataTrabajadorUpdate.cvNombreOriginal = body.cv.original;
        dataTrabajadorUpdate.cvNombreArchivo = body.cv.archivo;
        dataTrabajadorUpdate.cvRuta = body.cv.ruta;
        dataTrabajadorUpdate.cvMimeType = body.cv.mime;
        dataTrabajadorUpdate.cvPeso = body.cv.peso;
        }

        if (body.antecedentes) {
        dataTrabajadorUpdate.antecedentesNombreOriginal = body.antecedentes.original;
        dataTrabajadorUpdate.antecedentesNombreArchivo = body.antecedentes.archivo;
        dataTrabajadorUpdate.antecedentesRuta = body.antecedentes.ruta;
        dataTrabajadorUpdate.antecedentesMimeType = body.antecedentes.mime;
        dataTrabajadorUpdate.antecedentesPeso = body.antecedentes.peso;
        }

        const saved = await trabajadoresRepository.save(trabajadorFound);

        return [saved, null];
    } catch (error) {
        console.error("Error al modificar un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function despidoTrabajadorService(id, data) {
    try {
        const {
            despedido = true,
            motivo,
            archivo = null
        } = data;

        if (!motivo || !motivo.trim()) {
            return [null, "Debe indicar el motivo de su desvinculación"];
        }

        return await AppDataSource.transaction(async (manager) => {
        const trabajadoresRepository = manager.getRepository(Trabajador);
        const historialRepository = manager.getRepository(TrabajadorHistorialSchema);

        const trabajadorFound = await trabajadoresRepository.findOne({
            where:
            {
                id: Number(id),
                despedido: false,
            },
        })
        if (!trabajadorFound) {
            return [null, "Trabajador no encontrado"]
        };

        await trabajadoresRepository.update (
            { id: trabajadorFound.id },
            { despedido: Boolean(despedido),
                updatedAt: new Date()
            }
        );

        const historial = historialRepository.create({
            motivo: motivo.trim(),
            fechaDesvinculacion: new Date(),
            archivoNombreOriginal: archivo?.original ?? null,
            archivoNombreArchivo: archivo?.archivo ?? null,
            archivoRuta: archivo?.ruta ?? null,
            archivoMimeType: archivo?.mime ?? null,
            archivoPeso: archivo?.peso ?? null,
            trabajador: trabajadorFound.id,
        });

        await historialRepository.save(historial);

        const trabajadorData = await trabajadoresRepository.findOne({
            where: { 
                id: trabajadorFound.id 
                },
                relations: ["historialDesvinculaciones"],
            });

            return [trabajadorData, null];
        });
        } catch (error) {
            console.error("Error al despedir un trabajador:", error);
            return [null, "Error interno del servidor"];
        }
}

export async function recontratarTrabajadorService(id, despedido = false) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajadorFound = await trabajadoresRepository.findOne({
            where:
            {
                id: Number(id),
                despedido: true,
            },
        })
        if (!trabajadorFound) return [null, "Trabajador no encontrado"]

        const dataTrabajadorUpdate = {
            despedido: Boolean(despedido),
            updatedAt: new Date(),
        }

        await trabajadoresRepository.update({ id: trabajadorFound.id }, dataTrabajadorUpdate);

        const trabajadorData = await trabajadoresRepository.findOne({
            where: { id: trabajadorFound.id },
        });

        if (!trabajadorData) {
            return [null, "Trabajador no encontrado después de despedirse"];
        }

        return [trabajadorData, null];

    } catch (error) {
        console.error("Error al despedir un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createTrabajadoresService(trabajadoresData) {
    try {
        const { nombreCompleto,
            nacimiento,
            rut,
            email,
            grupo_id,
            rol,
            sexo,
            competencias,
            despedido } = trabajadoresData;
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const contactoRepository = AppDataSource.getRepository(Contacto);
        const gruposRepository = AppDataSource.getRepository(TrabajadoresGruposSchema);

        //verificar que el rut no esté ya registrado
        const existingRut = await TrabajadoresRepository.findOne({ where: { rut } })
        const existingContacto = await contactoRepository.findOne({ where: { contacto_rut: rut } })
        if (existingContacto || existingRut) return [null, "Rut ya registrado previamente"]

        //verificar que el correo electrónico no esté registrado
        const existingEmail = await TrabajadoresRepository.findOne({ where: [{ email: email }] })
        const existingContactoEmail = await contactoRepository.findOne({ where: [{ email: email }] })
        if (existingEmail || existingContactoEmail) return [null, "Email ya en uso"]

        const newTrabajador = TrabajadoresRepository.create({
            nombreCompleto,
            nacimiento,
            rut,
            email,
            rol,
            sexo,
            competencias,
            despedido: despedido ?? false,
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

        if (trabajadoresData.foto) {
        newTrabajador.fotoNombreOriginal = trabajadoresData.foto.original;
        newTrabajador.fotoNombreArchivo = trabajadoresData.foto.archivo;
        newTrabajador.fotoRuta = trabajadoresData.foto.ruta;
        newTrabajador.fotoMimeType = trabajadoresData.foto.mime;
        newTrabajador.fotoPeso = trabajadoresData.foto.peso;
        }
        if (trabajadoresData.cv) {
        newTrabajador.cvNombreOriginal = trabajadoresData.cv.original;
        newTrabajador.cvNombreArchivo = trabajadoresData.cv.archivo;
        newTrabajador.cvRuta = trabajadoresData.cv.ruta;
        newTrabajador.cvMimeType = trabajadoresData.cv.mime;
        newTrabajador.cvPeso = trabajadoresData.cv.peso;
        }
        if (trabajadoresData.antecedentes) {
        newTrabajador.antecedentesNombreOriginal = trabajadoresData.antecedentes.original;
        newTrabajador.antecedentesNombreArchivo = trabajadoresData.antecedentes.archivo;
        newTrabajador.antecedentesRuta = trabajadoresData.antecedentes.ruta;
        newTrabajador.antecedentesMimeType = trabajadoresData.antecedentes.mime;
        newTrabajador.antecedentesPeso = trabajadoresData.antecedentes.peso;
        }


        const trabajadorGuardado = await TrabajadoresRepository.save(newTrabajador);
        return [trabajadorGuardado, null];
    }
    catch (error) {
        return [null, error.message];
    }
}

export async function createGrupoService({ nombre, sede_id, supervisor_id, miembros_ids }) {
    try {
        const sedeRepo = AppDataSource.getRepository(Sede);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);

        const sede = await sedeRepo.findOneBy({
            sede_id: Number(sede_id)
        });
        if (!sede) {
            return [null, "Sede no encontrada"];
        }

        const supervisor = await trabajadorRepo.findOne({
            where: {
                id: Number(supervisor_id) }
        });

        if (!supervisor || supervisor.despedido) return [null, "Supervisor inválido"];
    if (String(supervisor.rol).toLowerCase() !== "supervisor") return [null, "El trabajador no tiene rol 'Supervisor'"];

    if (!Array.isArray(miembros_ids) || miembros_ids.length < 1) {
        return [null, "Debe indicar al menos 1 miembro"];
    }

    const miembros = await trabajadorRepo.find({
        where: miembros_ids.map((id) => ({
            id: Number(id) })),
    });

    if (miembros.length !== miembros_ids.length) {
        return [null, "Alguno de los miembros no existe"];
    }

    if (miembros.some(m => m.despedido)) {
        return [null, "Alguno de los miembros está despedido"];
    }

    return await AppDataSource.transaction(async (manager) => {
        const gruposRepoTx = manager.getRepository(TrabajadoresGruposSchema);
        const trabajadorRepoTx = manager.getRepository(Trabajador);

        const grupoToSave = gruposRepoTx.create({
            nombre,
            sedeAsignada: sede,
            supervisorAsignado: supervisor,
        });

        const savedGrupo = await gruposRepoTx.save(grupoToSave);

        for (const miembro of miembros) {
        miembro.grupoAsignado = savedGrupo;
        await trabajadorRepoTx.save(miembro);
        }

        const grupoFull = await gruposRepoTx.findOne({
            where: { 
                grupo_id: savedGrupo.grupo_id },
            relations: ["sedeAsignada", "supervisorAsignado", "miembros"],
        });

        return [grupoFull, null];
    });

    } catch (error) {
        console.log("Hubo un error al crear los grupos");
        return [null, error.message]
    }
}

export async function getGruposService() {
  try {
    const gruposRepo = AppDataSource.getRepository(TrabajadoresGruposSchema);
    const grupos = await gruposRepo.find({
      relations: ["sedeAsignada", "supervisorAsignado", "miembros"],
    });

    if (!grupos || grupos.length === 0) return [null, "No hay grupos"];
    return [grupos, null];
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    return [null, "Error interno del servidor"];
  }
}