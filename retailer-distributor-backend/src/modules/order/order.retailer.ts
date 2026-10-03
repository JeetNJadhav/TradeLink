import { OrderError } from "./order.errors";
import type { OrderTransaction } from "./order.unitOfWork";

// The authenticated user's id is User.id; orders belong to their Retailer profile.
export const resolveRetailerId = async (
  repositories: Pick<OrderTransaction, "retailers">,
  userId: string,
): Promise<string> => {
  const retailer = await repositories.retailers.findByUserId(userId);

  if (!retailer) {
    throw new OrderError("Retailer not found", 404);
  }

  return retailer.id;
};
