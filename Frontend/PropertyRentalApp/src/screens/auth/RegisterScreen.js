import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import Header from "../../components/common/Header";
import CustomInput from "../../components/common/CustomInput";
import PasswordInput from "../../components/common/PasswordInput";
import PrimaryButton from "../../components/common/PrimaryButton";
import COLORS from "../../theme/colors";
import { register } from "../../services/authService";
import { validateRegister } from "../../utils/validators";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("TENANT");
  const [loading, setLoading] = useState(false);

 

const handleRegister = async () => {
  const error = validateRegister(
    name,
    email,
    phone,
    password,
    confirmPassword
  );

  if (error) {
    Alert.alert("Validation", error);
    return;
  }

  try {
    setLoading(true);

    const response = await register({
      name,
      email,
      phone,
      password,
      role,
    });

    if (response.status === "success") {
      Alert.alert(
        "Success",
        "Registration successful",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } else {
      Alert.alert("Error", response.message);
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Create Account"
          subtitle="Register to continue"
        />

        <CustomInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <CustomInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.roleTitle}>Select Role</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "TENANT" && styles.selectedRole,
            ]}
            onPress={() => setRole("TENANT")}
          >
            <Text
              style={[
                styles.roleText,
                role === "TENANT" && styles.selectedRoleText,
              ]}
            >
              Tenant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "OWNER" && styles.selectedRole,
            ]}
            onPress={() => setRole("OWNER")}
          >
            <Text
              style={[
                styles.roleText,
                role === "OWNER" && styles.selectedRoleText,
              ]}
            >
              Owner
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Register"
          onPress={handleRegister}
          loading={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },

  selectedRole: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  roleText: {
    color: COLORS.text,
    fontWeight: "600",
  },

  selectedRoleText: {
    color: COLORS.white,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    color: COLORS.subText,
  },

  loginText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});