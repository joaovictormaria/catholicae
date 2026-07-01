import { StyleSheet, Text, View } from "react-native";
import { getOpenStatus } from "../utils/openingStatus";

export function OpenClosedBadge({ openingHours }: { openingHours: string | null }) {
  const status = getOpenStatus(openingHours);
  if (status === "unknown") return null;

  const isOpen = status === "open";

  return (
    <View style={[styles.badge, isOpen ? styles.open : styles.closed]}>
      <View style={[styles.dot, isOpen ? styles.dotOpen : styles.dotClosed]} />
      <Text style={[styles.label, isOpen ? styles.labelOpen : styles.labelClosed]}>
        {isOpen ? "Aberto" : "Fechado"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  open: {
    backgroundColor: "#DCFCE7",
  },
  closed: {
    backgroundColor: "#FEE2E2",
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  dotOpen: {
    backgroundColor: "#16A34A",
  },
  dotClosed: {
    backgroundColor: "#DC2626",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  labelOpen: {
    color: "#166534",
  },
  labelClosed: {
    color: "#991B1B",
  },
});
