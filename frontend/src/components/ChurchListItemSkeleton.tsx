import { StyleSheet, View } from "react-native";

export function ChurchListItemSkeleton() {
  return (
    <View style={styles.item}>
      <View style={[styles.bar, styles.name]} />
      <View style={[styles.bar, styles.distance]} />
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

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
    gap: 4,
  },
  bar: {
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
  },
  name: {
    height: 16,
    width: "60%",
  },
  distance: {
    height: 12,
    width: "30%",
  },
});
