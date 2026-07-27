import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native"

import Icon from "react-native-vector-icons/MaterialIcons"
import COLORS from "../../theme/colors"
import { changePassword } from "../../services/profileService"

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const onUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Validation", "Please fill all fields.")
      return
    }

    if (newPassword.length < 6) {
      Alert.alert("Validation", "Password must contain at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Validation",
        "New Password and Confirm Password do not match.",
      )
      return
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      })

      Alert.alert("Success", "Password changed successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.log(error.response?.data)

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to change password.",
      )
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Change Password</Text>

      {/* Current Password */}

      <Text style={styles.label}>Current Password</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter current password"
          secureTextEntry={!showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <Icon
            name={showCurrent ? "visibility" : "visibility-off"}
            size={24}
            color={COLORS.subText}
          />
        </TouchableOpacity>
      </View>

      {/* New Password */}

      <Text style={styles.label}>New Password</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry={!showNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
          <Icon
            name={showNew ? "visibility" : "visibility-off"}
            size={24}
            color={COLORS.subText}
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}

      <Text style={styles.label}>Confirm Password</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Icon
            name={showConfirm ? "visibility" : "visibility-off"}
            size={24}
            color={COLORS.subText}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={onUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
  },

  button: {
    marginTop: 25,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
})
