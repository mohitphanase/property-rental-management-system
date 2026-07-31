import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MyPropertiesScreen from "../screens/owner/property/MyPropertiesScreen";
import AddPropertyScreen from "../screens/owner/property/AddPropertyScreen";
import PropertyDetailsScreen from "../screens/owner/property/PropertyDetailsScreen";
import EditPropertyScreen from "../screens/owner/property/EditPropertyScreen";


const Stack = createNativeStackNavigator();

export default function PropertyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyProperties"
        component={MyPropertiesScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AddProperty"
        component={AddPropertyScreen}
        options={{
          title: "Add Property",
        }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{ title: "Property Details" }}
      />

      <Stack.Screen
        name="EditProperty"
        component={EditPropertyScreen}
      />

    </Stack.Navigator>


  );
}