"use strict";
import { Router } from "express";
import {
  getItemsController,
  createItemController,
  updateItemController,
  deleteItemController
} from "../controllers/item.controller.js";

const router = Router();

router
  .get("/", getItemsController)
  .post("/create/", createItemController)
  .put("/update/:id", updateItemController)
  .delete("/delete/:id", deleteItemController);

export default router;