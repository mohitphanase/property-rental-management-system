import React, { useContext } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/MaterialIcons"
import { View, StyleSheet, Platform } from "react-native"

import TenantHomeScreen from "../screens/tenant/TenantHomeScreen"
import WishlistScreen from "../screens/tenant/WishlistScreen"
import BookingScreen from "../screens/tenant/BookingScreen"
import ProfileScreen from "../screens/tenant/ProfileScreen"
import ReviewScreen from "../screens/tenant/ReviewScreen"

// Import ThemeContext instead of static COLORS
import { ThemeContext } from "../provider/ThemeProvider"

const Tab = createBottomTabNavigator()

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

        tabBarIcon: ({ color, focused, size }) => {
          let icon = "home"

          if (route.name === "Home") icon = "home"
          else if (route.name === "Wishlist") icon = "favorite"
          else if (route.name === "Booking") icon = "calendar-month"
          // else if (route.name === "Review") icon = "rate-review"
          else if (route.name === "Profile") icon = "person"

          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon
                name={icon}
                size={focused ? size + 2 : size}
                color={color}
              />
            </View>
          )
        },
      })}
    >
      <Tab.Screen name="Home" component={TenantHomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      {/* <Tab.Screen name="Review" component={ReviewScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

// Wrap styles in a function so it updates when COLORS changes
const getStyles = (COLORS) =>
  StyleSheet.create({
    tabBar: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: Platform.OS === "ios" ? 24 : 16,
      height: 68,
      borderRadius: 24,
      backgroundColor: COLORS.card,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: COLORS.shadow || "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      paddingHorizontal: 8,
      paddingTop: 8,
    },
    tabItem: {
      paddingVertical: 4,
    },
    iconWrap: {
      width: 40,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapActive: {
      backgroundColor: COLORS.primary + "15", // Matches your 15% opacity styling
    },
  })
