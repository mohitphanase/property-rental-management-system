// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });


import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AuthProvider from "./src/provider/AuthProvider";
import AppScreen from "./src/screens/AppScreen";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <AuthProvider>
        <AppScreen />
      </AuthProvider>

    </View>
  );
}
