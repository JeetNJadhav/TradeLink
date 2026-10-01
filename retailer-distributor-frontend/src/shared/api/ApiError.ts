import axios from "axios";

const NETWORK_ERROR_MESSAGE = "Unable to reach the server. Please try again.";
const UNKNOWN_ERROR_MESSAGE = "Something went wrong. Please try again.";

// The one error shape the rest of the app deals with.
// `status` is undefined when the request never got a response.
export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Backend errors look like { success: false, error: { message } }.
const readBackendMessage = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null) return null;
  const error = (body as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) return null;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message ? message : null;
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) return new ApiError(NETWORK_ERROR_MESSAGE);
    return new ApiError(
      readBackendMessage(error.response.data) ?? UNKNOWN_ERROR_MESSAGE,
      error.response.status,
    );
  }

  return new ApiError(
    error instanceof Error && error.message
      ? error.message
      : UNKNOWN_ERROR_MESSAGE,
  );
};
