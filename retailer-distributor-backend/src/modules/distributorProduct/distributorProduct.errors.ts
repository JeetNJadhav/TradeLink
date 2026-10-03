import { AppError } from "../../utils/errors";

export class ListingError extends AppError {}

// Thrown by the repository when the distributor already lists the product.
export class ListingConflictError extends Error {
  constructor() {
    super("You already list this product");
    this.name = "ListingConflictError";
  }
}
