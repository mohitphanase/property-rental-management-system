// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { useContext } from "react";
// import { AuthContext } from "../provider/AuthProvider";
// import SplashScreen from "./auth/SplashScreen";
// import LoginScreen from "./auth/LoginScreen";
// import RegisterScreen from "./auth/RegisterScreen";
// import OwnerHomeScreen from "./owner/OwnerHomeScreen";
// import TenantHomeScreen from "./tenant/TenantHomeScreen";

// const Stack = createNativeStackNavigator();

// export default function AppScreen() {
//   const { loading, token } = useContext(AuthContext);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {loading ? (
//           <Stack.Screen
//             name="Splash"
//             component={SplashScreen}
//           />
//         ) : token ? (
//           <>
//             {/* Home screens will be added later */}
//           </>
//         ) : (
//           <>
//             <Stack.Screen
//               name="Login"
//               component={LoginScreen}
//             />

//             <Stack.Screen
//               name="Register"
//               component={RegisterScreen}
//             />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { AuthContext } from '../provider/AuthProvider'

import SplashScreen from './auth/SplashScreen'
import LoginScreen from './auth/LoginScreen'
import RegisterScreen from './auth/RegisterScreen'

import OwnerNavigator from "../navigation/OwnerNavigator";
import TenantTabNavigator from '../navigation/TenantTabNavigator'

import TenantStackNavigator from '../navigation/TenantStackNavigator'

const Stack = createNativeStackNavigator()

export default function AppScreen() {
  const { loading, token, user } = useContext(AuthContext)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user?.role === "OWNER" ? (
          <Stack.Screen
            name="Owner"
            component={OwnerNavigator}
          />
        ) : (
          <Stack.Screen
            name="TenantHome"
            component={TenantStackNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
