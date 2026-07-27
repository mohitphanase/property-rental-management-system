import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { addPayment } from '../../services/paymentService'
import COLORS from '../../theme/colors'

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
    backgroundColor: COLORS.background,
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,

    elevation: 5,
    shadowColor: COLORS.shadow,
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
    color: COLORS.subText,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },

  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  propertyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,

    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.primary,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    color: COLORS.text,
  },

  paymentOption: {
    backgroundColor: COLORS.buttonPrimary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  paymentText: {
    color: COLORS.white,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  payButton: {
    marginTop: 30,
    backgroundColor: COLORS.buttonPrimary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',

    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  disabled: {
    backgroundColor: COLORS.disabled,
  },

  disabledText: {
    color: COLORS.white,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
})
