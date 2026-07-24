import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

import { useNavigation } from '@react-navigation/native'

export default function WishlistScreen() {
  const navigation = useNavigation()

  const onBookNow = () => {
    navigation.navigate('BookingForm', {
      property: {
        propertyId: 1,
        title: 'Sample Property',
      },
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist Screen</Text>

      <TouchableOpacity style={styles.bookButton} onPress={onBookNow}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  bookButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
