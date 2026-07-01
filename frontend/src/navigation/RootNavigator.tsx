import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { MapScreen } from "../screens/MapScreen";

export type RootTabParamList = {
  Lista: undefined;
  Mapa: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Lista" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
    </Tab.Navigator>
  );
}
