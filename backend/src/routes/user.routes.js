"use strict";
import { Router } from "express";
import { isAdmin, isCliente, isSupervisor, isTrabajador } from "../middlewares/authorization.middleware.js";
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
  .get("/", isAdmin, getUsers)
  .get("/detail/", getUser)
  .patch("/detail/", updateUser)
  .delete("/detail/", isAdmin, deleteUser);

export default router;