"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import ActivoFijo from "../entity/activofijo.entity.js";
import activoFijoRoutes from "./activoFijo.routes.js";
import itemRoutes from "./item.routes.js";
import trabajadoresRoutes from "./trabajadores.routes.js";
import capacitacionesRoutes from "./capacitacion.route.js";
import clienteRoutes from "./cliente.routes.js";
import solicitudRoutes from "./solicitud.routes.js";
import contratoCmercial from "./contratoComercial.routes.js";
const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/activos", activoFijoRoutes)
    .use("/item", itemRoutes)
    .use("/solicitud", solicitudRoutes)
    .use("/clientes", clienteRoutes)
    .use("/trabajadores", trabajadoresRoutes)
    .use("/capacitaciones", capacitacionesRoutes)
    .use("/contratos/comercial", contratoCmercial);

export default router;