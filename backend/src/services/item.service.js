"use strict";
import { AppDataSource } from "../config/configDb.js";
import Item from "../entity/item.entity.js";

export async function getItemsService() {
  try {
    const itemRepository = AppDataSource.getRepository(Item);

    const items = await itemRepository.find();

    if (!items || items.length === 0) return [null, "No hay items"];
    console.log("hay un total de %d items", items.length);
    const itemsData = items.map(({ id, ...item }) => item);
    return [items, null];//return [itemsData, null];

    //return { success: true, data: items, message: "si" }//[itemsData, null];
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

export async function deleteItemService(id) {
  try {
    const ItemRepository = AppDataSource.getRepository(Item);
    const result = await ItemRepository.delete(id);
    if (result.affected === 0) {
      return { success: false, message: "No existe un item con esa id" };
    }
    return { success: true, message: "Item borrado exitósamente" };
  } catch (error) {
    return { success: false, message: "Error borrando item", error: error.message };
  }
}

export async function updateItemService(id, updateData) {
  try {
    const ItemRepository = AppDataSource.getRepository(Item);
    const item = await ItemRepository.findOne({ where: { id } });
    if (!item) return { success: false, message: "Item no encontrado" };
    if (updateData.nombre && updateData.nombre.trim() !== "") item.nombre = updateData.nombre.trim();
    const updatedItem = await ItemRepository.save(item);
    return { success: true, data: updatedItem, message: "Item actualizado exitósamente" };
  } catch (error) {
    return { success: false, message: "Error actualizando item", error: error.message };
  }
}