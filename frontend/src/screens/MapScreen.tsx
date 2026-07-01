import { useState } from "react";
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.centered}>
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
    <View style={styles.container}>
      <MapView
        style={styles.map}
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
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{church.name}</Text>
                <OpenClosedBadge openingHours={church.openingHours} />
                <Text>Toque para ver a rota</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {selected && (
        <Pressable
          style={styles.selectedBar}
          onPress={() => navigation.navigate("ChurchDetail", { id: selected.id })}
        >
          <View style={styles.selectedBadge}>
            <OpenClosedBadge openingHours={selected.openingHours} />
          </View>
          <View style={styles.selectedRow}>
            <Text style={styles.selectedName}>{selected.name}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calloutContent: {
    gap: 4,
  },
  calloutTitle: {
    fontWeight: "600",
  },
  selectedBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 8,
    backgroundColor: "white",
    padding: 12,
    elevation: 4,
  },
  selectedBadge: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 80,
  },
  selectedName: {
    flexShrink: 1,
    fontWeight: "600",
  },
});
