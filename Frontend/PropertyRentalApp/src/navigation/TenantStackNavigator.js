import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import TenantTabNavigator from "./TenantTabNavigator"
import BookingDetailsScreen from "../screens/tenant/BookingDetailsScreen"
import PaymentScreen from "../screens/tenant/PaymentScreen"
import BookingFormScreen from "../screens/tenant/BookingFormScreen"
import ChangePasswordScreen from "../screens/tenant/ChangePasswordScreen"
import PropertyDetailsScreen from "../screens/tenant/PropertyDetailsScreen"

const Stack = createNativeStackNavigator()

export default function TenantStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TenantTabs"
        component={TenantTabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ title: "Booking Details" }}
      />

      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ title: "Payment" }}
      />
      <Stack.Screen
        name="BookingForm"
        component={BookingFormScreen}
        options={{ title: "Booking Form" }}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: "Change Password" }}
      />

      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{ title: "Property Details" }}
      />
    </Stack.Navigator>
  )
}
