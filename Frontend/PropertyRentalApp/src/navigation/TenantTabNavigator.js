import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { View, StyleSheet, Platform } from 'react-native'

import TenantHomeScreen from '../screens/tenant/TenantHomeScreen'
import WishlistScreen from '../screens/tenant/WishlistScreen'
import BookingScreen from '../screens/tenant/BookingScreen'
import ProfileScreen from '../screens/tenant/ProfileScreen'
import ReviewScreen from '../screens/tenant/ReviewScreen'

// Import ThemeContext instead of static COLORS
import { ThemeContext } from '../provider/ThemeProvider'

const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  Home: 'home',
  Wishlist: 'favorite',
  Booking: 'calendar-month',
  Review: 'rate-review',
  Profile: 'person',
}

export default function TenantTabNavigator() {
  // Pull dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // This completely removes the top header
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,

        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,

        tabBarIcon: ({ focused }) => {
          const icon = TAB_ICONS[route.name] || 'home'

          if (focused) {
            return (
              <View style={styles.raisedWrap}>
                <View style={styles.raisedCircle}>
                  <Icon name={icon} size={24} color="#FFFFFF" />
                </View>
              </View>
            )
          }

          return (
            <View style={styles.iconWrap}>
              <Icon name={icon} size={24} color={COLORS.placeholder} />
            </View>
          )
        },
      })}>
      <Tab.Screen name="Home" component={TenantHomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      {/* <Tab.Screen name="Review" component={ReviewScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const CIRCLE = 58

const getStyles = COLORS =>
  StyleSheet.create({
    tabBar: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: Platform.OS === 'ios' ? 28 : 18,
      height: 60,
      borderRadius: 30,
      backgroundColor: COLORS.card,
      borderTopWidth: 0,
      borderWidth: 1,
      borderColor: COLORS.border || 'rgba(0,0,0,0.05)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 10,
      overflow: 'visible',
      paddingHorizontal: 4,
    },
    tabItem: {
      overflow: 'visible',
      paddingVertical: 0,
      height: 60,
      justifyContent: 'center',
    },

    /* Inactive tab — flat icon, no chrome */
    iconWrap: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Active tab — a filled circle breaks out of the top of the bar */
    raisedWrap: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    raisedCircle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: CIRCLE / 2,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -(CIRCLE / 2 + 6),
      borderWidth: 4,
      borderColor: COLORS.background,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 10,
    },
  })
