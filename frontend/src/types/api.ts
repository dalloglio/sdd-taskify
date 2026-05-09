export interface ApiResponse<T = any> {
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  details?: any;
}
