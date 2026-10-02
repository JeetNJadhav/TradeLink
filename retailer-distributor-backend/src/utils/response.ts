import { ResponseToolkit } from "@hapi/hapi";

export const successResponse = (
  h: ResponseToolkit,
  data: unknown,
  statusCode = 200,
) => {
  return h
    .response({
      success: true,
      data,
    })
    .code(statusCode);
};

export const errorResponse = (
  h: ResponseToolkit,
  message: string,
  statusCode: number,
) => {
  return h
    .response({
      success: false,
      error: {
        message,
      },
    })
    .code(statusCode);
};

// common response helpers
