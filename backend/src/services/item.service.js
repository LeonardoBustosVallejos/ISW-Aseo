"use strict";
import { AppDataSource } from "../config/configDb.js";
import Item from "../entity/item.entity.js";

export async function getItemsService() {
  try {
    const itemRepository = AppDataSource.getRepository(Item);

    const items = await itemRepository.find();

    if (!items || items.length === 0) return [null, "No hay items"];

    const itemsData = items.map(({ id, ...item }) => item);

    return [itemsData, null];
  } catch (error) {
    console.error("Error al obtener a los items:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createItem(itemData) {
  try {
    const { nombre } = subjectData;
    const { id } = subjectData;
    if (!nombre || nombre.trim() === "") {
      return { success: false, message: "Es necesario que el item tenga un nombre" };
    }
    //en la línea de abajo en vez de "Item" puede que tenga que pasar como parámetro ItemSchema
    const ItemRepository = AppDataSource.getRepository("Item");
    const newItem = ItemRepository.create({
      nombre: nombre.trim(),
      id: id ? parseInt(id) : null
    });
    const savedItem = await ItemRepository.save(newItem);
    return {
      success: true,
      data: savedItem,
      message: "Item creado exitósamente"
    };
    } catch (error) {
      console.error("[ERROR Service] Error COMPLETO en createItem:", error);
      console.error("[ERROR Service] Stack Trace:", error.stack);
      return {
        success: false,
        message: "Error creando item",
        error: error.message
      };
    }
}