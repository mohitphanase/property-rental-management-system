import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

import { useNavigation } from '@react-navigation/native'
import COLORS from '../../theme/colors'

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
    backgroundColor: COLORS.background,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },

  bookButton: {
    backgroundColor: COLORS.buttonSecondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,

    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})
