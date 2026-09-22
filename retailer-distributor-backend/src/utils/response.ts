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

// a common response helper
