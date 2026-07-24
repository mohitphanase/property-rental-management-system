import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { addPayment } from '../../services/paymentService'

export default function PaymentScreen({ route, navigation }) {
  const { booking, property, amount } = route.params

  const onPayNow = () => {
    Alert.alert('Payment', 'Payment Successful', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ])
  }
  const onCashPayment = async () => {
    try {
      const response = await addPayment(booking.bookingId, amount)

      console.log('Payment Response:', response.data)

      Alert.alert('Success', 'Payment completed successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.pop(2),
        },
      ])
    } catch (error) {
      console.log('Error:', error.response?.data)
      console.log('Status:', error.response?.status)
      console.log('Message:', error.message)

      Alert.alert('Payment Failed')
    }
  }

  return (
    <View style={styles.propertyCard}>
      <Text style={styles.cardTitle}>Property Details</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Property</Text>
        <Text style={styles.value}>{property?.title}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{property?.propertyType}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>City</Text>
        <Text style={styles.value}>{property?.city}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{property?.description}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Monthly Rent</Text>
        <Text style={styles.amount}>₹{property?.price}</Text>
      </View>
      <Text style={styles.sectionTitle}>Select Payment Method</Text>

      <TouchableOpacity style={styles.paymentOption} onPress={onCashPayment}>
        <Text style={styles.paymentText}>💵 Cash Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paymentOption, styles.disabled]}
        onPress={() =>
          Alert.alert(
            'Under Maintenance',
            'Online Payment is currently unavailable.'
          )
        }>
        <Text style={styles.disabledText}>
          🌐 Online Payment (Under Maintenance)
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    color: '#666',
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },

  payButton: {
    marginTop: 30,
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1976D2',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },

  paymentOption: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  paymentText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  disabled: {
    backgroundColor: '#BDBDBD',
  },

  disabledText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
})
