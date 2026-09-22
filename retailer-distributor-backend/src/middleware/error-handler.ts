import { Request, ResponseToolkit } from "@hapi/hapi";

export const errorHandler = (
  request: Request,
  h: ResponseToolkit,
  err: Error,
) => {
  console.error(err);

  return h
    .response({
      success: false,
      error: {
        message: "Internal server error",
      },
    })
    .code(500);
};
