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
import { ChurchListSkeleton } from "../components/ChurchListItemSkeleton";
import { ErrorState } from "../components/ErrorState";
import { OpenClosedBadge } from "../components/OpenClosedBadge";

function ChurchListItem({ church, onPress }: { church: NearbyChurch; onPress: () => void }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.badge}>
        <OpenClosedBadge openingHours={church.openingHours} />
      </View>
      <Text style={styles.name}>{church.name}</Text>
      <Text style={styles.distance}>{formatDistance(church.distanceMeters)}</Text>
      {church.address && <Text style={styles.address}>{church.address}</Text>}
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
        <ActivityIndicator color="#7C3AED" />
        <Text style={styles.muted}>Obtendo localização...</Text>
      </View>
    );
  }

  if (locationError) {
    return <ErrorState message={locationError} />;
  }

  if (isPending) {
    return <ChurchListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState message="Não foi possível carregar as igrejas próximas." onRetry={refetch} />
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
      ListEmptyComponent={
        <Text style={styles.muted}>Nenhuma igreja encontrada perto de você.</Text>
      }
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
    borderBottomColor: "#E0E0E0",
  },
  badge: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  name: {
    paddingRight: 80,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  distance: {
    color: "#666666",
  },
  address: {
    fontSize: 12,
    color: "#999999",
  },
  muted: {
    color: "#666666",
  },
});
