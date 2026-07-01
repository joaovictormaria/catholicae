import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
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
    <Pressable className="border-b border-border p-4" onPress={onPress}>
      <View className="absolute right-4 top-4">
        <OpenClosedBadge openingHours={church.openingHours} />
      </View>
      <Text className="pr-20 text-base font-semibold text-black">{church.name}</Text>
      <Text className="text-muted">{formatDistance(church.distanceMeters)}</Text>
      {church.address && <Text className="text-xs text-faint">{church.address}</Text>}
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
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator color="#7C3AED" />
        <Text className="text-muted">Obtendo localização...</Text>
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
      contentContainerStyle={
        data?.churches.length === 0
          ? { flex: 1, alignItems: "center", justifyContent: "center" }
          : undefined
      }
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
        <Text className="text-muted">Nenhuma igreja encontrada perto de você.</Text>
      }
    />
  );
}
