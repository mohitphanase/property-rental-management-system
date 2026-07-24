import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import TenantTabNavigator from './TenantTabNavigator'
import BookingDetailsScreen from '../screens/tenant/BookingDetailsScreen'
import PaymentScreen from '../screens/tenant/PaymentScreen'

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
        options={{ title: 'Booking Details' }}
      />

      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  )
}
