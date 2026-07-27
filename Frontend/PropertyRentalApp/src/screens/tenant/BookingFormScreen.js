import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'

import DateTimePicker from '@react-native-community/datetimepicker'
import { addBooking } from '../../services/bookingService'
import COLORS from '../../theme/colors'

const BookingFormScreen = ({ route, navigation }) => {
  const { property } = route.params

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  useEffect(() => {
    console.log('Selected Property:', property)
    console.log('Property ID:', property?.propertyId)
  }, [])

  const onConfirmBooking = async () => {
    if (endDate < startDate) {
      Alert.alert('Validation', 'End Date must be greater than Start Date.')
      return
    }

    const bookingRequest = {
      propertyId: property.propertyId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }

    console.log('Booking Request:', bookingRequest)

    try {
      await addBooking(bookingRequest)

      Alert.alert('Success', 'Booking created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.log(error.response?.data)

      Alert.alert('Error', error.response?.data?.message || 'Booking failed.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.propertyCard}>
        <Text style={styles.propertyTitle}>🏠 {property?.title}</Text>

        <Text style={styles.propertyInfo}>📍 {property?.city}</Text>

        <Text style={styles.propertyInfo}>🏡 {property?.propertyType}</Text>

        <Text style={styles.propertyPrice}>₹ {property?.price} / Month</Text>

        <Text style={styles.description}>{property?.description}</Text>
      </View>

      <Text style={styles.label}>Start Date</Text>

      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowStartPicker(true)}>
        <Text>{startDate.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false)

            if (selectedDate) {
              setStartDate(selectedDate)
            }
          }}
        />
      )}

      <Text style={styles.label}>End Date</Text>

      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowEndPicker(true)}>
        <Text>{endDate.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={startDate}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false)

            if (selectedDate) {
              setEndDate(selectedDate)
            }
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={onConfirmBooking}>
        <Text style={styles.buttonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  )
}

export default BookingFormScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },

  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    color: COLORS.subText,
    marginBottom: 10,
  },

  dateInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },

  button: {
    marginTop: 25,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  propertyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,

    borderWidth: 1,
    borderColor: COLORS.border,

    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },

  propertyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },

  propertyInfo: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },

  propertyPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.success,
    marginVertical: 10,
  },

  description: {
    fontSize: 15,
    color: COLORS.subText,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
})
