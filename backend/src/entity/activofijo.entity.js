"use strict";
import { EntitySchema } from "typeorm";
import User from "./user.entity.js";

const ActivoFijo = new EntitySchema({
    name: "ActivoFijo",
    tablename: "activos_fijos",

    columns:{

        id:{
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
        },
        trabajador_id:{
            type:"int",
            nullable:true,
        },
        fecha_ingreso:{
            type: "timestamp",
            createDate:true,
        }
    },

    relations:{
        cliente:{

            target: User,
            type: "many-to-one",
            joinColumn:{
                name: "cliente_id",
                referencedColumnName: "id",
            },
            onDelete:"SET NULL",
        }
    }
});

export default ActivoFijo;