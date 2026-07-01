import { useState } from "react";
import { ActivityIndicator, Button, Pressable, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NearbyChurch, useNearbyChurches } from "../api/churches";
import { useUserLocation } from "../location/useUserLocation";
import { openDirections } from "../utils/openDirections";
import { RootStackParamList } from "../navigation/RootNavigator";
import { ErrorState } from "../components/ErrorState";
import { OpenClosedBadge } from "../components/OpenClosedBadge";

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { coords, errorMessage: locationError, isLoading: isLoadingLocation } = useUserLocation();
  const { data, isPending, isError, refetch } = useNearbyChurches(coords);
  const [selected, setSelected] = useState<NearbyChurch | null>(null);

  if (isLoadingLocation || (coords && isPending)) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (locationError || !coords) {
    return <ErrorState message={locationError ?? "Localização indisponível."} />;
  }

  if (isError) {
    return (
      <ErrorState message="Não foi possível carregar as igrejas próximas." onRetry={refetch} />
    );
  }

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {data?.churches.map((church) => (
          <Marker
            key={church.id}
            coordinate={{ latitude: church.latitude, longitude: church.longitude }}
            title={church.name}
            onPress={() => setSelected(church)}
          >
            <Callout onPress={() => openDirections(church.latitude, church.longitude)}>
              <View className="gap-1">
                <Text className="font-semibold">{church.name}</Text>
                <OpenClosedBadge openingHours={church.openingHours} />
                <Text>Toque para ver a rota</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {selected && (
        <Pressable
          className="absolute bottom-4 left-4 right-4 rounded-lg bg-white p-3 shadow-lg"
          onPress={() => navigation.navigate("ChurchDetail", { id: selected.id })}
        >
          <View className="absolute right-3 top-3">
            <OpenClosedBadge openingHours={selected.openingHours} />
          </View>
          <View className="flex-row items-center justify-between pr-20">
            <Text className="shrink font-semibold">{selected.name}</Text>
            <Button
              title="Como chegar"
              onPress={() => openDirections(selected.latitude, selected.longitude)}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
}
