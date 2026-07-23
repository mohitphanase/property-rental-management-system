import React from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native";
import COLORS from "../../theme/colors";

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry = false,
  editable = true,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      editable={editable}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    marginBottom: 15,
  },
});