"use strict";
import { Router } from "express";
import {
  createItemController,
  deleteItemController,
  getItemsController,
  updateItemController,
} from "../controllers/item.controller.js";

const router = Router();

router
  .get("/", getItemsController)
  .post("/create/", createItemController)
  .put("/update/:id", updateItemController)
  .delete("/delete/:id", deleteItemController)
  //ruta para recuperar todos los items de un tipo
  //ruta para borrar todos los items

export default router;