import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../theme/colors";

export default function StatsCard({
  title,
  value,
  icon,
  color = COLORS.primary,
}) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${color}20` },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={color}
        />
      </View>

      <Text style={styles.value}>{value}</Text>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    margin: 8,
    padding: 18,
    borderRadius: 18,

    elevation: 4,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 15,
  },

  value: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },

  title: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.gray,
  },
});