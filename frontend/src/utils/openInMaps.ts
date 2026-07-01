import { Linking } from "react-native";

export function openInMaps(latitude: number, longitude: number): void {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.openURL(url);
}
