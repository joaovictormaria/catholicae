import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChurchDetailScreen } from "../screens/ChurchDetailScreen";
import { TabNavigator } from "./TabNavigator";

export type RootStackParamList = {
  Tabs: undefined;
  ChurchDetail: { id: number };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ChurchDetail"
        component={ChurchDetailScreen}
        options={{ title: "Detalhes" }}
      />
    </Stack.Navigator>
  );
}
