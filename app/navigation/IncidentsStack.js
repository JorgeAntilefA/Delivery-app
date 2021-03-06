import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import IncidentsScreen from "../screens/Incidents";
import IncidentsListScreen from "../screens/IncidentsList";
import ResponseIncidentsScreen from "../screens/ResponseIncidents";
import Signature from "../components/Incidents/DigitalSignature";

const Stack = createStackNavigator();

export default function IncidentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="incidentsList" component={IncidentsListScreen} />
      <Stack.Screen name="incidents" component={IncidentsScreen} />
      <Stack.Screen
        name="responseIncidents"
        component={ResponseIncidentsScreen}
      />
      <Stack.Screen name="signatureI" component={Signature} />
    </Stack.Navigator>
  );
}
