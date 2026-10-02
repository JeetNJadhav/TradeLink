import { Request, ResponseToolkit } from "@hapi/hapi";
import { AppError } from "../utils/errors";
import { errorResponse } from "../utils/response";

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

  // Hapi's own client errors (validation, unknown route) carry a safe message.
  if (isBoom(err) && err.output.statusCode < 500) {
    return errorResponse(h, err.message, err.output.statusCode);
  }

  // Anything else is unexpected. Its message may hold internals (a query, a
  // file path), so it is logged and never sent to the client.
  console.error(err);

  return errorResponse(h, "Internal server error", 500);
};
