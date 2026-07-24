import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'

import DateTimePicker from '@react-native-community/datetimepicker'
import { addBooking } from '../../services/bookingService'

const BookingFormScreen = ({ route, navigation }) => {
  const { property } = route.params

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const onConfirmBooking = async () => {
    if (endDate < startDate) {
      Alert.alert('Validation', 'End Date must be greater than Start Date.')
      return
    }

    try {
      await addBooking({
        propertyId: property.propertyId,
        tenantId: 2, // Replace with logged-in user id
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })

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
      <Text style={styles.title}>Book Property</Text>

      <Text style={styles.label}>Property</Text>

      <Text style={styles.propertyName}>{property?.title}</Text>

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
          display="default"
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
          display="default"
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
    backgroundColor: '#F5F5F5',
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#222',
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },

  propertyName: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 20,
  },

  dateInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },

  button: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
