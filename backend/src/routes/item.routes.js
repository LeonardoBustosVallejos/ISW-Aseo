"use strict";
import { Router } from "express";
import {
  getItemsController,
  createItemController
} from "../controllers/item.controller.js";

const router = Router();

router
  .get("/", getItemsController)
  .post("/create/", createItemController);

export default router;