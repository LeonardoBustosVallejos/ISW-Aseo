import { EntitySchema } from "typeorm";

const contratoSchema = new EntitySchema({
    name: "Contrato",
    tableName: "contrato",
    columns: {
        contrato_id: {
            type: "int",
            primary: true,
            generated: true,
        },
        fechaInicio: {
            type: "date",
            nullable: false,
        },
        fechaFin: {
            type: "date",
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["VIGENTE", "TERMINADO", "ESPERA"],
            default: "ESPERA",
        },
        monto: {
            type: "int",
            default: 0,
        },
        archivo: {
            type: "varchar",
            nullable: true //posibilidad de cambio más adelante
        },
        descripcion: {
            type: "text",
            default: "Sin descripción"
        }
    },
    indices: [
        {
            name: "IDX_CONTRATO",
            columns: ["id"],
            unique: true,
        },
    ],
    relations: {
        usuario: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "id" },
            onDelete: "CASCADE",
            nullable: false,
        },
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
            nullable: true // 🔥 IMPORTANTE
        }
    }
});
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