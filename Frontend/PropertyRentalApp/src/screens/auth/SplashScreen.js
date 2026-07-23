import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";

export default function SplashScreen() {
  return (
    <>
      <StatusBar
        backgroundColor="#F8FAFC"
        barStyle="dark-content"
      />

      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* App Name */}
          <Text style={styles.title}>Property Rental</Text>

          {/* Tagline */}
          <Text style={styles.subtitle}>
            Find your perfect home
          </Text>

          {/* Loader */}
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Version 1.0
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50,
    width: "100%",
  },

  logo: {
    width: 170,
    height: 170,
    marginBottom: 25,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#2563EB",
    letterSpacing: 0.5,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },

  loader: {
    marginTop: 55,
  },

  footer: {
    position: "absolute",
    bottom: 35,
    fontSize: 14,
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
});