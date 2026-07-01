import { View } from "react-native";

export function ChurchListItemSkeleton() {
  return (
    <View className="gap-1 border-b border-border p-4">
      <View className="h-4 w-3/5 rounded bg-skeleton" />
      <View className="h-3 w-3/12 rounded bg-skeleton" />
    </View>
  );
}

export function ChurchListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ChurchListItemSkeleton key={index} />
      ))}
    </View>
  );
}
