import { EntitySchema } from "typeorm";


const TrabajadoresAsignadosSchema = new EntitySchema({
    name: "TrabajadoresAsignados",
    tableName: "trabajadores_asignados",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        estado: {
            type: "varchar",
            enum: ["ASIGNADO", "REMOVIDO", "FINALIZADO"],
            length: 255,
            nullable: false,
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
        trabajador: {
            type: "many-to-one",
            target: "Trabajador",
            joinColumn: { name: "trabajador_id" },
            onDelete: "CASCADE"
        },
        cliente: {
            type: "many-to-one",
            target: "Cliente",
            joinColumn: { name: "cliente_id" },
            onDelete: "CASCADE"
        },
        sede: {
            type: "many-to-one",
            target: "Sede",
            joinColumn: { name: "sede_id" },
            onDelete: "CASCADE"
        }
    }
})

export default TrabajadoresAsignadosSchema