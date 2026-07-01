import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { ApiResponse } from "./types";
import { UserCoords } from "../location/useUserLocation";

export interface NearbyChurch {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  source: string;
  distanceMeters: number;
}

export interface NearbyResult {
  churches: NearbyChurch[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useNearbyChurches(coords: UserCoords | null, radiusKm = 10) {
  return useQuery({
    queryKey: ["churches", "nearby", coords, radiusKm],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<NearbyResult>>("/churches/nearby", {
        params: { latitude: coords!.latitude, longitude: coords!.longitude, radiusKm },
      });
      return data.data;
    },
    enabled: coords !== null,
  });
}
