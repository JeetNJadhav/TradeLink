import { LOW_STOCK_THRESHOLD } from "./types/listing";

export type StockLevel = "out" | "low" | "ok";

export const stockLevelOf = (stock: number): StockLevel => {
  if (stock === 0) return "out";
  return stock <= LOW_STOCK_THRESHOLD ? "low" : "ok";
};
