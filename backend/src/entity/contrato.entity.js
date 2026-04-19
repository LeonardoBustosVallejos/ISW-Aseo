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
        fecha_inicio: {
            type: "date",
            nullable: false,
        },
        fecha_fin: {
            type: "date",
            nullable: false,
        },
        estado: {
            type: "enum",
            enum: ["VIGENTE", "TERMINADO", "ESPERA"],
            default: "ESPERA",
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
            joinColumn: { name: "user_id" },
            onDelete: "CASCADE",
            nullable: false,
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