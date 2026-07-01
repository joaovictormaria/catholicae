import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { MapScreen } from "../screens/MapScreen";

export type TabParamList = {
  Lista: undefined;
  Mapa: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Lista" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
    </Tab.Navigator>
  );
}
