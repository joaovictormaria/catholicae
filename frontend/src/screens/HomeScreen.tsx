import { StyleSheet, Text, View } from "react-native";
import { useHealth } from "../api/health";

export function HomeScreen() {
  const { data, isPending, isError } = useHealth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catholicaê</Text>
      <Text>Encontre uma igreja católica perto de você.</Text>
      {isPending && <Text>Conectando à API...</Text>}
      {isError && <Text>Não foi possível conectar à API.</Text>}
      {data && <Text>{data.churches} igrejas cadastradas.</Text>}
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
