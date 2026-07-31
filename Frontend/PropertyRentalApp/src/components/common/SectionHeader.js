import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import COLORS from "../../theme/colors";

export default function SectionHeader({
  title,
  buttonText,
  onPress,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {buttonText && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.button}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    marginBottom: 12,
    paddingHorizontal: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  button: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
});