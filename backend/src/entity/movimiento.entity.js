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
        trabajador_id:{
            type: "int",
            nullable: true
        },
        nombre_trabajador:{
            type: "varchar",
            nullable: true
        }
    }
});

export default Movimiento;