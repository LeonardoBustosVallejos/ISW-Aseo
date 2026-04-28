"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import ActivoFijo from "../entity/activofijo.entity.js";
import activoFijoRoutes from "./activoFijo.routes.js";
import itemRoutes from "./item.routes.js";
import trabajadoresRoutes from "./trabajadores.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/activos", activoFijoRoutes)
    .use("/item", itemRoutes)
    .use("/trabajadores", trabajadoresRoutes);

export default router;