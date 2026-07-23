import React from "react";
import {TouchableOpacity,Text,StyleSheet,ActivityIndicator,} from "react-native";
import COLORS from "../../theme/colors";

export default function PrimaryButton({title, onPress, loading = false, disabled = false,style,})
 {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
  },

  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.6,
  },
});