import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import COLORS from "../../theme/colors";

export default function PasswordInput({
  placeholder,
  value,
  onChangeText,
}) {
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureText}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setSecureText(!secureText)}
      >
        <Text style={styles.icon}>
          {secureText ? "👁️" : "🙈"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 15,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  iconContainer: {
    position: "absolute",
    right: 15,
    top: 13,
  },

  icon: {
    fontSize: 20,
  },
});