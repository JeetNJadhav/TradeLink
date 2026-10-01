// Envelope every successful backend response is wrapped in.
export interface ApiResponse<T> {
  success: true;
  data: T;
}
