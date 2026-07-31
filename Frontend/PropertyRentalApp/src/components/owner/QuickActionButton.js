import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../theme/colors";

export default function QuickActionButton({
  title,
  icon,
  color = COLORS.primary,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={30}
        color={color}
      />

      <Text style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    margin: 8,
    borderRadius: 18,
    paddingVertical: 22,

    justifyContent: "center",
    alignItems: "center",

    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  title: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
});