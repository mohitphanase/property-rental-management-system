import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";

import Header from "../../components/common/Header";
import CustomInput from "../../components/common/CustomInput";
import PasswordInput from "../../components/common/PasswordInput";
import PrimaryButton from "../../components/common/PrimaryButton";
import COLORS from "../../theme/colors";
import { AuthContext } from "../../provider/AuthProvider";
import { validateLogin } from "../../utils/validators";

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  const error = validateLogin(email, password);

  if (error) {
    Alert.alert("Validation", error);
    return;
  }

  try {
    setLoading(true);

    await login(email, password);

    // AuthProvider updates the user and token.
    // AppScreen will automatically navigate.

  } catch (error) {
    Alert.alert("Login Failed", error.message);
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
          title="Welcome Back"
          subtitle="Login to continue"
        />

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotContainer}
          onPress={() => {}}
        >
          <Text style={styles.forgotText}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />

        <View style={styles.footer}>

          <Text style={styles.footerText}>
            Don't have an account?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerText}>
              Register
            </Text>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },

  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },

  forgotText: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  footerText: {
    color: COLORS.subText,
  },

  registerText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: 5,
  },

});