import React from 'react'
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native'
import COLORS from '../../theme/colors'

export default function TenantHomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Hello 👋</Text>
      <Text style={styles.title}>Find Your Dream Property</Text>

      <TextInput style={styles.search} placeholder="Search by city, area..." />

      <Text style={styles.heading}>Featured Properties</Text>
      {/* dummy data */}
      <View style={styles.card}>
        <Text style={styles.propertyTitle}>2 BHK Apartment</Text>
        <Text>Pune</Text>
        <Text style={styles.price}>₹15,000 / Month</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.propertyTitle}>1 BHK Flat</Text>
        <Text>Mumbai</Text>
        <Text style={styles.price}>₹12,000 / Month</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },

  welcome: {
    fontSize: 18,
    color: COLORS.subText,
    marginTop: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 10,
  },

  search: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,

    borderWidth: 1,
    borderColor: COLORS.border,

    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  price: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
})
