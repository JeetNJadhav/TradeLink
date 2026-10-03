import { MAX_LISTING_PRICE, MAX_LISTING_STOCK } from "./types/listing";

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const STOCK_PATTERN = /^\d+$/;

// What was typed into a price field as a number, or null when it is not a
// price the backend accepts: above zero, with at most two decimals.
export const parsePrice = (text: string): number | null => {
  const trimmed = text.trim();
  if (!PRICE_PATTERN.test(trimmed)) return null;

  const price = Number(trimmed);
  return price > 0 && price <= MAX_LISTING_PRICE ? price : null;
};

// What was typed into a stock field as a number, or null when it is not a
// whole number from zero up.
export const parseStock = (text: string): number | null => {
  const trimmed = text.trim();
  if (!STOCK_PATTERN.test(trimmed)) return null;

  const stock = Number(trimmed);
  return stock <= MAX_LISTING_STOCK ? stock : null;
};

export const PRICE_HINT = "Enter a price above 0 with at most two decimals.";
export const STOCK_HINT = "Enter the stock as a whole number, 0 or more.";
