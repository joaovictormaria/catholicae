import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NearbyChurch, useNearbyChurches } from "../api/churches";
import { useUserLocation } from "../location/useUserLocation";
import { formatDistance } from "../utils/formatDistance";
import { RootStackParamList } from "../navigation/RootNavigator";

function ChurchListItem({ church, onPress }: { church: NearbyChurch; onPress: () => void }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Text style={styles.itemName}>{church.name}</Text>
      <Text style={styles.itemDistance}>{formatDistance(church.distanceMeters)}</Text>
      {church.address && <Text style={styles.itemAddress}>{church.address}</Text>}
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { coords, errorMessage: locationError, isLoading: isLoadingLocation } = useUserLocation();
  const { data, isPending, isError, refetch } = useNearbyChurches(coords);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  if (isLoadingLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>Obtendo localização...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centered}>
        <Text>{locationError}</Text>
      </View>
    );
  }

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>Buscando igrejas próximas...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Não foi possível carregar as igrejas próximas.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={data?.churches.length === 0 ? styles.centered : undefined}
      data={data?.churches ?? []}
      keyExtractor={(church) => String(church.id)}
      renderItem={({ item }) => (
        <ChurchListItem
          church={item}
          onPress={() => navigation.navigate("ChurchDetail", { id: item.id })}
        />
      )}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text>Nenhuma igreja encontrada perto de você.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  item: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemDistance: {
    color: "#555",
  },
  itemAddress: {
    color: "#777",
    fontSize: 12,
  },
});
