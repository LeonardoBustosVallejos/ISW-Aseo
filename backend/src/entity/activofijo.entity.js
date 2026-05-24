"use strict";
import { EntitySchema } from "typeorm";
import ClienteSchema from "./cliente.entity.js";
import TrabajadorSchema from "./trabajador.entity.js";

const ActivoFijo = new EntitySchema({
    name: "ActivoFijo",
    tablename: "activos_fijos",

    columns:{

        activo_id:{
            primary:true,
            type:"int",
            generated:true
        },
        codigo_inventario:{
            type:"varchar",
            unique:true,
        },
        nombre:{
            type:"varchar",
        },
        estado:{
            type:"varchar",
            default:"Buen Estado",
        },
        cliente_id:{
            type:"int",
            nullable:true,
        },
        trabajador_id:{
            type:"int",
            nullable:true,
        },
        fecha_ingreso:{
            type: "date",
            createDate:true,
        }
    },

    relations:{
        cliente:{
            target: ClienteSchema,
            type: "many-to-one",
            joinColumn:{
                name: "cliente_id",
                referencedColumnName: "id",
            },
            onDelete: "SET NULL"
        },

        trabajador:{
            traget: TrabajadorSchema,
            type: "many-to-one",
            joinColumn:{
                name: "trabajador_id",
                referencedColumnName: "id"
            },
            onDelete: "SET NULL"
        }
    }
});

export default ActivoFijo;