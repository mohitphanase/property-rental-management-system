import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../theme/colors";

export default function DashboardHeader({
  name = "Owner",
  onNotificationPress,
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.greeting}>
          ☀️ {getGreeting()}
        </Text>

        <Text style={styles.name}>
          Hi, {name} 👋
        </Text>

        <Text style={styles.subtitle}>
          Welcome back!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={COLORS.white}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  leftContainer: {
    flex: 1,
  },

  greeting: {
    color: "#DCE8FF",
    fontSize: 15,
  },

  name: {
    marginTop: 8,
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,
    color: "#DCE8FF",
    fontSize: 16,
  },

  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",
  },
});