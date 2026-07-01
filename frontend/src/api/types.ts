export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface HealthStatus {
  status: string;
  churches: number;
}
