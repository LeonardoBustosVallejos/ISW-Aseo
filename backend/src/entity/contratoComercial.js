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
        fechaInicio: {
            type: "date",
            nullable: false,
        },
        fechaFinOriginal: {
            type: "date",
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["VIGENTE", "TERMINADO", "SUSPENDIDO", "ESPERA",],
            default: "ESPERA",
            nullable: false,
        },
        monto: {
            type: "int",
            default: 0,
        },
        archivo: {
            type: "varchar",
            unique: true,
            nullable: true //posibilidad de cambio más adelante
        },
        descripcion: {
            type: "text",
            default: "Sin descripción"
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
    indices: [
        {
            name: "IDX_CONTRATO_COMERCIAL",
            columns: ["id_contrato_comercial"],
            unique: true,
        },
    ],
    relations: {
        cliente: {
            target: "Cliente",
            type: "many-to-one",
            joinColumn: true,
            nullable: false, //el contrato si o si debe ser dirigido a alguien
            onDelete: "CASCADE"
        },
        sede: {
            target: "Sede",
            type: "many-to-one",
            joinColumn: { name: "sede_id" },
            nullable: false //IMPORTANTE, al regitrar un contrato debe existir una sede sujeta a un cliente
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