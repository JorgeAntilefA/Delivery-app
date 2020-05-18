import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ManagedOrdersScreen from "../screens/ManagedOrders";
import ModifyManagedOrderScreen from "../screens/ModifyManagedOrder";

const Stack = createStackNavigator();

export default function ManageOrderStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="managedOrders" component={ManagedOrdersScreen} />
      <Stack.Screen
        name="modifyManagedOrder"
        component={ModifyManagedOrderScreen}
      />
    </Stack.Navigator>
  );
}
