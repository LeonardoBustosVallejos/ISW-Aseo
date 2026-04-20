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

export async function createItemService(itemData) {
    try {
        const { nombre, descripcion, disponibilidadActual, disponibilidadTotal } = itemData;
        const ItemRepository = AppDataSource.getRepository(Item);
        const newItem = ItemRepository.create({
            nombre: nombre,
            descripcion: descripcion,
            disponibilidadActual: disponibilidadActual, 
            disponibilidadTotal: disponibilidadTotal
        });
        const itemGuardado = await ItemRepository.save(newItem);
        return [itemGuardado, null];
    } catch (error) {
        return [null, error.message];
    }
}