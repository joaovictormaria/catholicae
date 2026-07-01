import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import { useChurch } from "../api/churches";
import { openDirections } from "../utils/openDirections";
import { openInMaps } from "../utils/openInMaps";
import { RootStackScreenProps } from "../navigation/RootNavigator";

export function ChurchDetailScreen({ route }: RootStackScreenProps<"ChurchDetail">) {
  const { data: church, isPending, isError } = useChurch(route.params.id);

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !church) {
    return (
      <View style={styles.centered}>
        <Text>Não foi possível carregar esta igreja.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{church.name}</Text>
      {church.address && <Text style={styles.line}>{church.address}</Text>}
      {(church.city || church.state) && (
        <Text style={styles.line}>{[church.city, church.state].filter(Boolean).join(" - ")}</Text>
      )}
      {church.phone && <Text style={styles.line}>{church.phone}</Text>}

      <View style={styles.actions}>
        <Button
          title="Como chegar"
          onPress={() => openDirections(church.latitude, church.longitude)}
        />
        <Button
          title="Abrir no mapa"
          onPress={() => openInMaps(church.latitude, church.longitude)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  line: {
    fontSize: 16,
    color: "#444",
  },
  actions: {
    marginTop: 16,
    gap: 8,
  },
});
