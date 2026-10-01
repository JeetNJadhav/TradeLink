import { Request, ResponseToolkit } from "@hapi/hapi";
import { AppError } from "../utils/errors";

const errorResponse = (
  h: ResponseToolkit,
  message: string,
  statusCode: number,
) =>
  h
    .response({
      success: false,
      error: {
        message,
      },
    })
    .code(statusCode);

const isBoom = (
  err: Error,
): err is Error & { output: { statusCode: number } } =>
  "isBoom" in err && err.isBoom === true && "output" in err;

export const errorHandler = (
  request: Request,
  h: ResponseToolkit,
  err: Error,
) => {
  // Checked first: Hapi wraps thrown errors as Boom 500s, but keeps the original class.
  if (err instanceof AppError) {
    return errorResponse(h, err.message, err.statusCode);
  }

  console.error(err);

  if (isBoom(err)) {
    return errorResponse(h, err.message, err.output.statusCode);
  }

  return errorResponse(h, "Internal server error", 500);
};
