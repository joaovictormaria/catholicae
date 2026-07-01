import { StyleSheet, Text, View } from "react-native";
import { useHealth } from "../api/health";
import { useUserLocation } from "../location/useUserLocation";

export function HomeScreen() {
  const { data, isPending, isError } = useHealth();
  const { coords, errorMessage, isLoading: isLoadingLocation } = useUserLocation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catholicaê</Text>
      <Text>Encontre uma igreja católica perto de você.</Text>
      {isPending && <Text>Conectando à API...</Text>}
      {isError && <Text>Não foi possível conectar à API.</Text>}
      {data && <Text>{data.churches} igrejas cadastradas.</Text>}
      {isLoadingLocation && <Text>Obtendo localização...</Text>}
      {errorMessage && <Text>{errorMessage}</Text>}
      {coords && (
        <Text>
          Você está em {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
