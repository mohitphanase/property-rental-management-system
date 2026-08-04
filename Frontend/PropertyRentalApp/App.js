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

import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useContext } from 'react' // Make sure to import this

import AuthProvider from './src/provider/AuthProvider'
import { ThemeProvider, ThemeContext } from './src/provider/ThemeProvider'
import AppScreen from './src/screens/AppScreen'

// 1. Create a wrapper component to consume the ThemeContext
const RootApp = () => {
  const { isDarkMode, COLORS } = useContext(ThemeContext)

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* 2. Automatically switch status bar text color based on theme */}
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <SafeAreaProvider>
        <AppScreen />
      </SafeAreaProvider>
    </View>
  )
}

// 3. Wrap RootApp inside your providers
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootApp />
      </ThemeProvider>
    </AuthProvider>
  )
}
