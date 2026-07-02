import { EntitySchema } from "typeorm";

const Movimiento = new EntitySchema({
    name: "Movimiento",
    tableName: "movimientos_activos",
    columns:{
        movimiento_id:{
            primary: true,
            type: "int",
            generated: true
        },
        tipo_movimiento:{
            type: "varchar"
        },
        descripcion:{
            type: "varchar"
        },
        fecha:{
            type: "timestamp",
            createDate: true
        },
        cliente_id:{
            type: "int",
            nullable: true
        },
        activos_ids:{
            type: "simple-array",
            nullable: true
        },
        sede_id: {
            type: "int",
            nullable: true,
        },
        trabajador_id:{
            type: "int",
            nullable: true
        }
    },

    relations:{
        cliente:{
            target: "Cliente",
            type: "many-to-one",
            joinColumn:{
                name: "cliente_id",
                referencedColumnName: "cliente_id",
            },
            onDelete: "SET NULL"
        },
        
        sede: {
            target: "Sede",
            type: "many-to-one",
            joinColumn: {
                name: "sede_id",
                referencedColumnName: "sede_id",
            },
            onDelete: "SET NULL"
        },

        trabajador:{
            target: "Trabajador",
            type: "many-to-one",
            joinColumn:{
                name: "trabajador_id",
                referencedColumnName: "id"
            },
            onDelete: "SET NULL"
        }
    }
});

export default Movimiento;