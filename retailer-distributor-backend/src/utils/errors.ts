// Base class for expected errors whose message and status are safe to send to the client.
// The global error handler turns any AppError into a response, so new error types
// only need to extend this class.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
