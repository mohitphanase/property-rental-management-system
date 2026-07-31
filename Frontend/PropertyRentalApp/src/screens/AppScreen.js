

import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../provider/AuthProvider";

import SplashScreen from "./auth/SplashScreen";
import LoginScreen from "./auth/LoginScreen";
import RegisterScreen from "./auth/RegisterScreen";
import TenantHomeScreen from "./tenant/TenantHomeScreen";
import OwnerNavigator from "../navigation/OwnerNavigator";

const Stack = createNativeStackNavigator();

export default function AppScreen() {
  const { loading, token, user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />
        ) : !token ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        ) : user?.role === "OWNER" ? (
          <Stack.Screen
            name="Owner"
            component={OwnerNavigator}
          />
        ) : (
          <Stack.Screen
            name="TenantHome"
            component={TenantHomeScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}