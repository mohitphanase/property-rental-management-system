import React from 'react'
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native'

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
    backgroundColor: '#F5F5F5',
  },
  welcome: {
    fontSize: 18,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    color: 'green',
    marginTop: 5,
    fontWeight: 'bold',
  },
})
