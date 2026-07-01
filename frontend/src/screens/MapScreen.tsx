import { useState } from "react";
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NearbyChurch, useNearbyChurches } from "../api/churches";
import { useUserLocation } from "../location/useUserLocation";
import { openDirections } from "../utils/openDirections";
import { RootStackParamList } from "../navigation/RootNavigator";

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { coords, errorMessage: locationError, isLoading: isLoadingLocation } = useUserLocation();
  const { data, isPending } = useNearbyChurches(coords);
  const [selected, setSelected] = useState<NearbyChurch | null>(null);

  if (isLoadingLocation || (coords && isPending)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (locationError || !coords) {
    return (
      <View style={styles.centered}>
        <Text>{locationError ?? "Localização indisponível."}</Text>
      </View>
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
              <Text style={styles.calloutTitle}>{church.name}</Text>
              <Text>Toque para ver a rota</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {selected && (
        <Pressable
          style={styles.selectedBar}
          onPress={() => navigation.navigate("ChurchDetail", { id: selected.id })}
        >
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Button
            title="Como chegar"
            onPress={() => openDirections(selected.latitude, selected.longitude)}
          />
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
  calloutTitle: {
    fontWeight: "600",
  },
  selectedBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  selectedName: {
    flexShrink: 1,
    fontWeight: "600",
  },
});
