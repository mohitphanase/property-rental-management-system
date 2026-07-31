import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons"
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "../screens/owner/dashboard/DashboardScreen";
import PropertyNavigator from "./PropertyNavigator";
import BookingListScreen from "../screens/owner/booking/BookingListScreen";
import ProfileScreen from "../screens/owner/profile/ProfileScreen";
import COLORS from './../theme/colors';


const Tab = createBottomTabNavigator();

export default function OwnerNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
          paddingTop: 8,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Dashboard":
              iconName = "grid";
              break;

            case "Properties":
              iconName = "home";
              break;

            case "Bookings":
              iconName = "calendar";
              break;

            case "Payments":
              iconName = "wallet";
              break;

            case "Profile":
              iconName = "person";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Properties" component={PropertyNavigator} />
      <Tab.Screen name="Bookings" component={BookingListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}