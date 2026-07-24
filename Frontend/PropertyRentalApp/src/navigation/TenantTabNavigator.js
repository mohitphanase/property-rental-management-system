import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'

import TenantHomeScreen from '../screens/tenant/TenantHomeScreen'
import WishlistScreen from '../screens/tenant/WishlistScreen'
import BookingScreen from '../screens/tenant/BookingScreen'
import ProfileScreen from '../screens/tenant/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function TenantTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: 'Property Rental',
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let icon = 'home'

          if (route.name === 'Home') icon = 'home'
          else if (route.name === 'Wishlist') icon = 'favorite'
          else if (route.name === 'Booking') icon = 'calendar-month'
          else if (route.name === 'Profile') icon = 'person'

          return <Icon name={icon} size={size} color={color} />
        },
      })}>
      <Tab.Screen name="Home" component={TenantHomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
