import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "../../theme/colors";

export default function Header({
  title,
  subtitle,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },

  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.subText,
    lineHeight: 22,
  },
});