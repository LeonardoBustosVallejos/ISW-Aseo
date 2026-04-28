"use strict";
import { Router } from "express";
import { login, logout, register, registerCliente } from "../controllers/auth.controller.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";

const router = Router();

router
  .post("/login", login) //       api/auth/login
  .post("/register", register)//  api/auth/register
  .post("/logout", logout)//     api/auth/logout

  .post("/registerCliente", isAdmin, registerCliente)
export default router;