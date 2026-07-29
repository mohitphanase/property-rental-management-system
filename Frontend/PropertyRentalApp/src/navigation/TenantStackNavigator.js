import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import TenantTabNavigator from './TenantTabNavigator'
import BookingDetailsScreen from '../screens/tenant/BookingDetailsScreen'
import PaymentScreen from '../screens/tenant/PaymentScreen'
import BookingFormScreen from '../screens/tenant/BookingFormScreen'
import ChangePasswordScreen from '../screens/tenant/ChangePasswordScreen'
import PropertyDetailsScreen from '../screens/tenant/PropertyDetailsScreen'

const Stack = createNativeStackNavigator()

export default function TenantStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hides the default headers since we built custom ones in the screens
        animation: 'slide_from_right', // Smooth, modern page transitions
        contentStyle: { backgroundColor: '#F8F9FA' }, // Fallback background color matching our theme
      }}>
      <Stack.Screen name="TenantTabs" component={TenantTabNavigator} />

      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />

      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

      <Stack.Screen name="BookingForm" component={BookingFormScreen} />

      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
    </Stack.Navigator>
  )
}
