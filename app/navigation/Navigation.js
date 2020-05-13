import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import LoginScreen from "../screens/Login";
import ManifestsScreen from "../screens/Manifests";
import PendingOrderscreen from "../screens/PendingOrders";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="login"
        tabBarOptions={{
          inactiveTintColor: "#646464",
          activeTintColor: "#00a680",
        }}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => screenOptions(route, color),
        })}
      >
        <Tab.Screen
          name="login"
          component={LoginScreen}
          options={{ title: "salir", tabBarVisible: false }}
        />
        <Tab.Screen
          name="manifests"
          component={ManifestsScreen}
          options={{ title: "Manifiestos", tabBarVisible: false }}
        />
        <Tab.Screen
          name="pendings"
          component={PendingOrderscreen}
          options={{ title: "Pendientes" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function screenOptions(route, color) {
  let iconName;

  switch (route.name) {
    case "login":
      iconName = "compass-outline";
      break;
    default:
      break;
  }

  return (
    <Icon
      type="material-community"
      name={iconName}
      size={22}
      color={color}
    ></Icon>
  );
}
