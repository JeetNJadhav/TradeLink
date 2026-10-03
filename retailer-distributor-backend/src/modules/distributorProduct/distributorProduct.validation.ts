import Joi from "joi";

// Upper bounds keep a typo from becoming a price or stock nobody can mean.
export const MAX_LISTING_PRICE = 10_000_000;
export const MAX_LISTING_STOCK = 1_000_000;

// strict(): a price with more than two decimals is refused, not rounded.
const price = Joi.number()
  .strict()
  .positive()
  .precision(2)
  .max(MAX_LISTING_PRICE);

const stock = Joi.number().strict().integer().min(0).max(MAX_LISTING_STOCK);

export const distributorProductParamsSchema = Joi.object({
  distributorProductId: Joi.string().guid({ version: "uuidv4" }).required(),
});

export const addListingSchema = Joi.object({
  productId: Joi.string().guid({ version: "uuidv4" }).required(),
  price: price.required(),
  stock: stock.required(),
});

// Price, stock, or both.
export const updateListingSchema = Joi.object({
  price,
  stock,
}).or("price", "stock");
