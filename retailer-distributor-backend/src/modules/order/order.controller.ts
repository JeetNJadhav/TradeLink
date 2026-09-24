import { Request, ResponseToolkit } from "@hapi/hapi";
import { createOrder, CreateOrderInput, OrderError } from "./order.service";
import { successResponse } from "../../utils/response";

export const createOrderHandler = async (
  request: Request,
  h: ResponseToolkit,
) => {
  try {
    const input = request.payload as CreateOrderInput;
    const { userId } = request.app.authenticatedUser!;
    const order = await createOrder(userId, input);

    return successResponse(h, { order }, 201);
  } catch (error) {
    if (error instanceof OrderError) {
      return h
        .response({
          success: false,
          error: {
            message: error.message,
          },
        })
        .code(error.statusCode);
    }

    throw error;
  }
};
