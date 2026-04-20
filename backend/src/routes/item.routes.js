"use strict";
import { Router } from "express";
import {
  getItems,
  createItem
} from "../controllers/item.controller.js";

const router = Router();

router
  .get("/", getItems)
  .post("/item-create/", createItem);

export default router;