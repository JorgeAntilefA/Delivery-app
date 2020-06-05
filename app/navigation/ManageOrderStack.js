import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PendingScreen from "../screens/PendingOrders";
import ManageOrderScreen from "../screens/ManageOrder";
import SignatureScreen from "../components/ManageOrder/DigitalSignature";
import IncidentsScreen from "../screens/Incidents";

const Stack = createStackNavigator();

export default function ManageOrderStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="pendientes" component={PendingScreen} />
      <Stack.Screen name="manageOrder" component={ManageOrderScreen} />
      <Stack.Screen name="digitalSignature" component={SignatureScreen} />
      <Stack.Screen name="incidents" component={IncidentsScreen} />
    </Stack.Navigator>
  );
}
