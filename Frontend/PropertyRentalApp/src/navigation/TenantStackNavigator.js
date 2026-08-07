import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import TenantTabNavigator from './TenantTabNavigator'
import BookingDetailsScreen from '../screens/tenant/BookingDetailsScreen'
import PaymentScreen from '../screens/tenant/PaymentScreen'
import BookingFormScreen from '../screens/tenant/BookingFormScreen'
import ChangePasswordScreen from '../screens/tenant/ChangePasswordScreen'
import PropertyDetailsScreen from '../screens/tenant/PropertyDetailsScreen'
import ReviewScreen from '../screens/tenant/ReviewScreen'
import MyReviewsScreen from '../screens/tenant/MyReviewsScreen'

const Stack = createNativeStackNavigator()

export default function TenantStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hides native headers in favor of custom screen header bars
        animation: 'slide_from_right', // Smooth right-to-left transition
        contentStyle: { backgroundColor: '#F8F9FA' }, // Default background color matching the theme
      }}>
      {/* Bottom Tab Bar Stack */}
      <Stack.Screen name="TenantTabs" component={TenantTabNavigator} />

      {/* Booking Screens */}
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />

      {/* Payment Screen */}
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

      {/* Property Details */}
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />

      {/* Review Screens */}
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />

      {/* Settings / Security */}
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  )
}
