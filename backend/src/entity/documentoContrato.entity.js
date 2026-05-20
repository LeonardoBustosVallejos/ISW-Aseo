import { EntitySchema } from "typeorm";


const DocumentoComercialSchema = new EntitySchema({
    name: "DocumentoComercial",
    tableName: "documento_comercial",
    columns: {
        id_documento: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombreOriginal: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        nombreArchivo: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        ruta: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        mimeType: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        extension: {
            type: "varchar",
            length: 12,
            nullable: false
        },
        peso: {
            type: "bigint",
            nullable: false
        },
        estado: {
            type: "enum",
            enum: ["APROVADO", "RECHAZADO", "PENDIENTE"],
            default: "PENDIENTE"
        },
        tipoDocumento: {
            type: "enum",
            enum: ["CONTRATO", "ANEXO", "RENOVACION", "OTRO"]
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
    relations: {
        contratoComercial: {
            target: "ContratoComercial",
            type: "many-to-one",
            joinColumn: { name: "id_contrato_comercial" },
            nullable: true,
            onDelete: "CASCADE"
        },
        contratoLaboral: {
            target: "ContratoLaboral",
            type: "many-to-one",
            joinColumn: { name: "contrato_laboral_id" },
            nullable: true,
            onDelete: "CASCADE"
        }
    }
})


export default DocumentoComercialSchema