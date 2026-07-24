import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { TouchableOpacity, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TenantHomeScreen from '../screens/tenant/TenantHomeScreen'
import WishlistScreen from '../screens/tenant/WishlistScreen'
import BookingScreen from '../screens/tenant/BookingScreen'
import ProfileScreen from '../screens/tenant/ProfileScreen'
import { useContext } from 'react'
import { AuthContext } from '../provider/AuthProvider'

const Tab = createBottomTabNavigator()

export default function TenantTabNavigator() {
  const { logout } = useContext(AuthContext)
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: 'Property Rental',
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() =>
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  onPress: logout,
                },
              ])
            }>
            <Icon name="logout" size={24} color="#D32F2F" />
          </TouchableOpacity>
        ),

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
