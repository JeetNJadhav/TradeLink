import { Request, ResponseToolkit } from "@hapi/hapi";

export const errorHandler = (
  request: Request,
  h: ResponseToolkit,
  err: Error,
) => {
  console.error(err);

  if ("isBoom" in err && err.isBoom) {
    return h
      .response({
        success: false,
        error: {
          message: err.message,
        },
      })
      .code(err.output.statusCode);
  }

  return h
    .response({
      success: false,
      error: {
        message: "Internal server error",
      },
    })
    .code(500);
};
