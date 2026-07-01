import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { ApiResponse, HealthStatus } from "./types";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<HealthStatus>>("/health");
      return data.data;
    },
  });
}
