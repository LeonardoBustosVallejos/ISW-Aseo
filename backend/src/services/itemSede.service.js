"use strict";
import { AppDataSource } from "../config/configDb.js";
import ItemSede from "../entity/itemSede.entity.js";

export async function getItemSedesService() {
  try {
    const itemSedeRepository = AppDataSource.getRepository(ItemSede);

    const itemSedes = await itemSedeRepository.find();

    if (!itemSedes || itemSedes.length === 0) return [null, "No hay item_sede registrados"];

    return [itemSedes, null];
  } catch (error) {
    console.error("Error al obtener los item_sede:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createItemSedeService(itemSedeData) {
  try {
    const { id_item, id_sede, cantidad } = itemSedeData;
    const itemSedeRepository = AppDataSource.getRepository(ItemSede);

    const itemSedeExistente = await itemSedeRepository.findOne({ where: { id_item, id_sede } });
    if (itemSedeExistente) {
      itemSedeExistente.cantidad += cantidad;
      const itemSedeActualizado = await itemSedeRepository.save(itemSedeExistente);
      return [itemSedeActualizado, null];
    }

    const newItemSede = itemSedeRepository.create({
      id_item: id_item,
      id_sede: id_sede,
      cantidad: cantidad,
    });
    const itemSedeGuardado = await itemSedeRepository.save(newItemSede);
    return [itemSedeGuardado, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteItemSedeService(id) {
  try {
    const itemSedeRepository = AppDataSource.getRepository(ItemSede);
    const result = await itemSedeRepository.delete(id);
    if (result.affected === 0) {
      return { success: false, message: "No existe un item_sede con esa id" };
    }
    return { success: true, message: "Item_sede borrado exitósamente" };
  } catch (error) {
    return { success: false, message: "Error borrando item_sede", error: error.message };
  }
}

export async function updateItemSedeService(id, updateData) {
  try {
    const itemSedeRepository = AppDataSource.getRepository(ItemSede);
    const itemSede = await itemSedeRepository.findOne({ where: { id } });
    if (!itemSede) return { success: false, message: "Item_sede no encontrado" };
    itemSede.id_item = updateData.id_item;
    itemSede.id_sede = updateData.id_sede;
    itemSede.cantidad = updateData.cantidad;
    const updatedItemSede = await itemSedeRepository.save(itemSede);
    return { success: true, data: updatedItemSede, message: "Item_sede actualizado exitósamente" };
  } catch (error) {
    return { success: false, message: "Error actualizando item_sede", error: error.message };
  }
}
