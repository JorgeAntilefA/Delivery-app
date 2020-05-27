import React from "react";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import LoginScreen from "../screens/Login";
import ManifestsScreen from "../screens/Manifests";
import PendingOrdersStack from "../navigation/ManageOrderStack";
import ManagedOrdersStack from "../navigation/ManagedOrderStack";
import IncidentsStack from "../navigation/IncidentsStack";

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
          component={PendingOrdersStack}
          options={{ title: "Pendientes" }}
        />
        <Tab.Screen
          name="managedOrder"
          component={ManagedOrdersStack}
          options={{ title: "Gestionados" }}
        />
        <Tab.Screen
          name="incidenList"
          component={IncidentsStack}
          options={{ title: "Solicitudes" }}

          //initialParams={{ sobrante: "Sobrante" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function screenOptions(route, color) {
  let iconName;

  switch (route.name) {
    case "login":
      iconName = "undo";
      break;
    case "manifests":
      iconName = "table-large";
      break;
    case "pendings":
      iconName = "truck-fast";
      break;
    case "managedOrder":
      iconName = "truck-check";
      break;
    case "incidenList":
      iconName = "alert-octagon-outline";
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
