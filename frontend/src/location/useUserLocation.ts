import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

export interface UserCoords {
  latitude: number;
  longitude: number;
}

interface UserLocationState {
  coords: UserCoords | null;
  errorMessage: string | null;
  isLoading: boolean;
}

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    coords: null,
    errorMessage: null,
    isLoading: true,
  });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (isMounted) {
          setState({
            coords: null,
            errorMessage: "Permissão de localização negada.",
            isLoading: false,
          });
        }
        return;
      }

      const initial = await Location.getCurrentPositionAsync();
      if (isMounted) {
        setState({
          coords: { latitude: initial.coords.latitude, longitude: initial.coords.longitude },
          errorMessage: null,
          isLoading: false,
        });
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 50 },
        (position) => {
          if (isMounted) {
            setState({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              errorMessage: null,
              isLoading: false,
            });
          }
        },
      );
    }

    start().catch((error: unknown) => {
      if (isMounted) {
        setState({
          coords: null,
          errorMessage: error instanceof Error ? error.message : "Erro ao obter localização.",
          isLoading: false,
        });
      }
    });

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return state;
}
