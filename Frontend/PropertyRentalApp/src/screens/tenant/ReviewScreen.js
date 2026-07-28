import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import COLORS from '../../theme/colors'

export default function ReviewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reviews</Text>
      <Text style={styles.subtitle}>
        Your submitted reviews will appear here.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.subText,
    textAlign: 'center',
  },
})
