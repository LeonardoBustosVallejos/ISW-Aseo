import { EntitySchema } from "typeorm";

const ContratoAnexoSchema = new EntitySchema({
    name: "ContratoAnexo",
    tableName: "contrato_anexo",

    columns: {
        id_anexo: {
            type: "int",
            primary: true,
            generated: true,
        },

        numeroAnexo: {
            type: "varchar",
            length: 50,
            nullable: false,
        },

        fechaInicio: {
            type: "date",
            nullable: false,
        },

        fechaFin: {
            type: "date",
            nullable: true,
        },

        montoNuevo: {
            type: "numeric",
            nullable: true,
        },

        cantidadMinTrabajadores: {
            type: "int",
            nullable: true,
        },

        descripcion: {
            type: "text",
            nullable: true,
        },

        tipoAnexo: {
            type: "enum",
            enum: ["RENOVACION", "AUMENTO_PERSONAL", "REDUCCION_PERSONAL", "CAMBIO_MONTO", "SERVICIO_ADICIONAL", "OTRO"],
            default: "OTRO"
        },
        cantidadMaxTrabajadores: {
            type: "int",
            nullable: true
        },

        tipoJornada: {
            type: "enum",
            enum: ["DIURNA", "NOCTURNA", "MIXTA", "TURNOS"],
            nullable: true
        },

        tamanoInstalacion: {
            type: "enum",
            enum: ["PEQUENA", "MEDIANA", "GRANDE", "INDUSTRIAL"],
            nullable: true
        },

        requiereGuardias: {
            type: "boolean",
            nullable: true
        },

        observacionesOperativas: {
            type: "text",
            nullable: true
        },

        detalles: {
            type: "text",
            nullable: true
        },
        createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
        }
    },

    relations: {
        contratoComercial: {
            target: "ContratoComercial",
            type: "many-to-one",
            joinColumn: { name: "contrato_comercial_id" },
            nullable: false,
            onDelete: "CASCADE"
        },

        documentos: {
            type: "one-to-many",
            target: "DocumentoContrato",
            inverseSide: "anexo"
        },
        sedes: {
            target: "Sede",
            type: "many-to-many",
            joinTable: { name: "rel_sede_anexo", referencedColumnName: "sede_id" }, //IMPORTANTE, al regitrar un contrato debe existir una sede sujeta a un cliente
            nullable: true,
            onDelete: "CASCADE"
        }
    }
})

export default ContratoAnexoSchema