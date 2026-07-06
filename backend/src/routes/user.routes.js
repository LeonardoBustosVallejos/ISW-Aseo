"use strict";
import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router
  .use(authenticateJwt)
router
  .get("/", authorizeRoles(["Administrador"]), getUsers)
  .get("/detail/", getUser)
  .patch("/detail/", updateUser)
  .delete("/detail/", authorizeRoles(["Administrador"]), deleteUser);

export default router;