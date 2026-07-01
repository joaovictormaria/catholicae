import { Text, View } from "react-native";
import { getOpenStatus } from "../utils/openingStatus";

export function OpenClosedBadge({ openingHours }: { openingHours: string | null }) {
  const status = getOpenStatus(openingHours);
  if (status === "unknown") return null;

  const isOpen = status === "open";

  return (
    <View
      className={`flex-row items-center gap-1 self-start rounded-full px-2 py-0.5 ${
        isOpen ? "bg-green-100" : "bg-red-100"
      }`}
    >
      <View className={`h-2 w-2 rounded-full ${isOpen ? "bg-green-600" : "bg-red-600"}`} />
      <Text className={`text-xs font-medium ${isOpen ? "text-green-800" : "text-red-800"}`}>
        {isOpen ? "Aberto" : "Fechado"}
      </Text>
    </View>
  );
}
