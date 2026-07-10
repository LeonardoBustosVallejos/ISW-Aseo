"use strict";
import { Router } from "express";
import {
  createItemSedeController,
  deleteItemSedeController,
  getItemSedesController,
  updateItemSedeController,
} from "../controllers/itemSede.controller.js";

const router = Router();

router
  .get("/", getItemSedesController)
  .post("/create/", createItemSedeController)
  .put("/update/:id", updateItemSedeController)
  .delete("/delete/:id", deleteItemSedeController)

export default router;
