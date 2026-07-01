import { ActivityIndicator, Button, Text, View } from "react-native";
import { useChurch } from "../api/churches";
import { openDirections } from "../utils/openDirections";
import { openInMaps } from "../utils/openInMaps";
import { RootStackScreenProps } from "../navigation/RootNavigator";
import { ErrorState } from "../components/ErrorState";
import { OpenClosedBadge } from "../components/OpenClosedBadge";

export function ChurchDetailScreen({ route }: RootStackScreenProps<"ChurchDetail">) {
  const { data: church, isPending, isError, refetch } = useChurch(route.params.id);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (isError || !church) {
    return <ErrorState message="Não foi possível carregar esta igreja." onRetry={refetch} />;
  }

  return (
    <View className="flex-1 gap-2 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-2 text-2xl font-bold">{church.name}</Text>
        <OpenClosedBadge openingHours={church.openingHours} />
      </View>
      {church.address && <Text className="text-base text-neutral-700">{church.address}</Text>}
      {(church.city || church.state) && (
        <Text className="text-base text-neutral-700">
          {[church.city, church.state].filter(Boolean).join(" - ")}
        </Text>
      )}
      {church.phone && <Text className="text-base text-neutral-700">{church.phone}</Text>}

      <View className="mt-4 gap-2">
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
