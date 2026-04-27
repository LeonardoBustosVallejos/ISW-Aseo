"use strict";
import { Router } from "express";
import {
  getItemsController,
  createItemController,
  deleteItemController
} from "../controllers/item.controller.js";

const router = Router();

router
  .get("/", getItemsController)
  .post("/create/", createItemController)
  .delete("/delete/:id", deleteItemController);

export default router;