import { EntitySchema } from "typeorm";

const contratoLaboralSchema = new EntitySchema({
    name: "ContratoLaboral",
    tableName: "contrato_laboral",
    columns: {
        id_contrato_laboral: {
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
            nullable: true,
        },
        estado: {
            type: "enum",
            enum: ["ACTIVO", "DESPEDIDO", "RENUNCIA", "LICENCIA", "ESPERA", "TERMINADO"],
            default: "ESPERA",
            nullable: false,
        },
        tipoDuracion: {
            type: "enum",
            enum: ["FIJO", "INDEFINIDO", "OBRA", "REEMPLAZO"],
            default: "FIJO",
            nullable: false,
        },
        monto: {
            type: "int",
            default: 0,
        },
        archivo: {
            type: "varchar",
            nullable: true //CAMBIAR A FUTURO
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
            name: "IDX_CONTRATO_LABORAL",
            columns: ["id_contrato_laboral"],
            unique: true,
        },
    ],
    relations: {
        trabajador: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "id" },
            onDelete: "CASCADE",
            nullable: false,
        },
    }
});

export default contratoLaboralSchema;
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