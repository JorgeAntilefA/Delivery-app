import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PendingScreen from "../screens/PendingOrders";
import ManageOrderScreen from "../screens/ManageOrder";
import SignatureScreen from "../components/ManageOrder/DigitalSignature";

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
    </Stack.Navigator>
  );
}
// const PendingOrdersScreenStacks = createStackNavigator({
//   PendingOrders: {
//     screen: PendingScreen,
//     navigationOptions: () => ({
//       headerShown: false,
//     }),
//   },
//   ManageOrder: {
//     screen: ManageOrderScreen,

//     navigationOptions: () => ({
//       headerShown: false,
//     }),
//   },
//   DigitalSignature: {
//     screen: SignatureScreen,

//     navigationOptions: () => ({
//       headerShown: false,
//     }),
//   },
// });

// export default PendingOrdersScreenStacks;
