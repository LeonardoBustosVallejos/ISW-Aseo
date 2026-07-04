import { EntitySchema } from "typeorm";

const contratoComercialSchema = new EntitySchema({
    name: "ContratoComercial",
    tableName: "contrato_comercial",
    columns: {
        id_contrato_comercial: {
            type: "int",
            primary: true,
            generated: true,
        },
        codigoContrato: {
            type: "varchar",
            length: 50,
            unique: true
        },
        fechaInicio: {
            type: "date",
            nullable: false,
        },
        fechaFinOriginal: { //fecha original de fin de contrato
            type: "date",
            nullable: false,
        },
        fechaFinReal: { //fecha ajustada de fin de contrato
            type: "date",
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["VIGENTE", "TERMINADO", "SUSPENDIDO", "ESPERA", "ATRASADO", "CANCELADO"],
            default: "ESPERA",
            nullable: false,
        },
        /*
        * ESPERA: El contrato existe, pero aún no llega su fecha de inicio.
        * ATRASADO: Ya debería haber comenzado, pero hay impedimentos para iniciarlo.
        * VIGENTE: Está en ejecución.
        * SUSPENDIDO: Se pausó temporalmente.
        * TERMINADO: Se ejecutó y finalizó normalmente.
        * CANCELADO: Se decidió no ejecutar o dar por terminado el proceso antes de que se completara.
        */
        jornada: {
            type: "enum",
            enum: ["COMPLETA", "PARCIAL"],
            default: "COMPLETA",
            nullable: false
        },
        monto: {
            type: "numeric",
            default: 0,
        },
        detalles: {
            type: "text",
            default: "Sin descripción"
        },
        cantidadMinTrabajadores: {
            type: "int",
            default: 0
        },
        cantidadMaxTrabajadores: {
            type: "int",
            default: 0
        },

        tipoJornada: {
            type: "enum",
            enum: [
                "DIURNA",
                "NOCTURNA",
                "MIXTA",
                "TURNOS"
            ],
            default: "DIURNA"
        },

        tamanoInstalacion: {
            type: "enum",
            enum: [
                "PEQUENA",
                "MEDIANA",
                "GRANDE",
                "INDUSTRIAL"
            ],
            nullable: true
        },

        requiereGuardias: {
            type: "boolean",
            default: false
        },

        observacionesOperativas: {
            type: "text",
            nullable: true
        },
        createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
        updatedAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            nullable: false,
        },
    },
    listeners: [
        {
            type: "before-insert",
            method: "actualizarEstado"
        },
        {
            type: "before-update",
            method: "actualizarEstado"
        }
    ],
    indices: [
        {
            name: "IDX_CONTRATO_COMERCIAL",
            columns: ["id_contrato_comercial"],
            unique: true,
        },
    ],
    relations: {
        anexos: {
            type: 'one-to-many',
            target: 'ContratoAnexo',
            inverseSide: 'contratoComercial'
        },
        documentos: {
            type: "one-to-many",
            target: "DocumentoContrato",
            inverseSide: "contratoComercial"
        },
        cliente: {
            target: "Cliente",
            type: "many-to-one",
            joinColumn: { name: "cliente_id" },
            nullable: false, //el contrato si o si debe ser dirigido a alguien
            onDelete: "CASCADE",
        },
        sedes: {
            target: "Sede",
            type: "many-to-many",
            joinTable: { name: "rel_contrato_sede" }, //IMPORTANTE, al regitrar un contrato debe existir una sede sujeta a un cliente
            nullable: false,
            onDelete: "CASCADE",
        }
    }
});
export default contratoComercialSchema;
/*
export const ContratoArchivoSchema = new EntitySchema({
    name: "ContratoArchivo",
    tableName: "contrato_archivos",
    columns: {
        archivo_id: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombreArchivo: {
            type: "varchar",
        },
        ruta: {
            type: "varchar", // o URL si usas cloud
        },
        tipoMime: {
            type: "varchar", // application/pdf
        },
        fechaSubida: {
            type: "timestamp",
            createDate: true,
        }
    },
    relations: {
        contrato: {
            type: "many-to-one",
            target: "Contrato",
            joinColumn: true,
            nullable: false,
        }
    }
});*/