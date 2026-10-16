export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiClient {
  get: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
  delete: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
}
