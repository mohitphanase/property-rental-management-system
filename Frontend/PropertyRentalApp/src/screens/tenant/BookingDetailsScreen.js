import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useEffect, useState } from 'react'
import { getPropertyImages } from '../../services/propertyImageService'
import { SERVER_URL } from '../../utils/config'

import { getPropertyById } from '../../services/propertyService'
import { getPaymentByBooking } from '../../services/paymentService'
import { deleteBooking } from '../../services/bookingService'

export default function BookingDetailsScreen({ route, navigation }) {
  const { booking } = route.params

  const [property, setProperty] = useState(null)
  const [propertyImage, setPropertyImage] = useState(null)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    loadProperty()
    loadPropertyImage()
    checkPayment()
  }, [])
  const loadProperty = async () => {
    try {
      const response = await getPropertyById(booking.propertyId)
      setProperty(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const loadPropertyImage = async () => {
    try {
      const response = await getPropertyImages(booking.propertyId)

      if (response.data.data.length > 0) {
        setPropertyImage(response.data.data[0].imageUrl)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const checkPayment = async () => {
    try {
      const response = await getPaymentByBooking(booking.bookingId)

      if (response.data.status === 'success' && response.data.data) {
        setIsPaid(true)
      }
    } catch (error) {
      console.log(error.response?.data)
    }
  }

  console.log('Property:', property)
  console.log('Amount:', property?.price)
  const onPayNow = () => {
    navigation.navigate('PaymentScreen', {
      booking,
      property,
      amount: property?.price,
    })
  }

  const onCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await deleteBooking(booking.bookingId)

              Alert.alert('Success', 'Booking cancelled successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.pop(2),
                },
              ])
            } catch (error) {
              console.log(error.response?.data)
              Alert.alert('Error', 'Unable to cancel booking.')
            }
          },
        },
      ]
    )
  }

  const getStatusStyle = status => {
    switch (status) {
      case 'APPROVED':
        return styles.approved

      case 'REJECTED':
        return styles.rejected

      default:
        return styles.pending
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Booking Details</Text>

      {/* Property Card */}

      <View style={styles.propertyCard}>
        <Image
          source={
            propertyImage
              ? { uri: `${SERVER_URL}${propertyImage}` }
              : require('../../../assets/property_placeholder.png')
          }
          style={styles.propertyImage}
        />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>
            {property?.title || property?.propertyName}
          </Text>

          <Text style={styles.location}>
            {property?.city || property?.location}
          </Text>

          <Text style={styles.value}>₹{property?.rent}</Text>
          <Text style={styles.value}>
            {booking.startDate} - {booking.endDate}
          </Text>
          <Text style={styles.totalAmount}>₹{property?.rent}</Text>

          <View style={[styles.statusBadge, getStatusStyle(booking.status)]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>
      </View>

      {/* Booking Details */}

      <View style={styles.detailsCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Booking ID</Text>
          <Text style={styles.value}>{booking.bookingId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Property ID</Text>
          <Text style={styles.value}>{booking.propertyId}</Text>
        </View>

        {/* <View style={styles.row}>
          <Text style={styles.label}>Tenant ID</Text>
          <Text style={styles.value}>{booking.tenantId}</Text>
        </View> */}

        <View style={styles.row}>
          <Text style={styles.label}>Booking Date</Text>
          <Text style={styles.value}>{booking.createdAt}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>{booking.startDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>End Date</Text>
          <Text style={styles.value}>{booking.endDate}</Text>
        </View>
      </View>

      {/* Payment Status */}

      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Booking Status</Text>

        <View
          style={[
            styles.statusBadge,
            booking.status === 'APPROVED'
              ? styles.approved
              : booking.status === 'REJECTED'
                ? styles.rejected
                : styles.pending,
          ]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      {/* Buttons */}

      {isPaid ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ Payment Completed</Text>
        </View>
      ) : booking.status === 'APPROVED' ? (
        <TouchableOpacity style={styles.payButton} onPress={onPayNow}>
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      ) : booking.status === 'CANCELLED' ? (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>❌ Booking Cancelled</Text>
        </View>
      ) : (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>Waiting for owner approval.</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.cancelButton,
          booking.status === 'CANCELLED' && { backgroundColor: '#BDBDBD' },
        ]}
        onPress={onCancelBooking}
        disabled={booking.status === 'CANCELLED'}>
        <Text style={styles.cancelButtonText}>
          {booking.status === 'CANCELLED'
            ? 'Booking Cancelled'
            : 'Cancel Booking'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  pendingBox: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 12,
  },

  pendingText: {
    color: '#856404',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  propertyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  propertyImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginRight: 15,
  },

  propertyInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },

  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 12,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  approved: {
    backgroundColor: '#4CAF50',
  },

  pending: {
    backgroundColor: '#FF9800',
  },

  rejected: {
    backgroundColor: '#F44336',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },

  label: {
    fontSize: 15,
    color: '#666',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },

  paymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },

  payButton: {
    backgroundColor: '#1976D2',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
  },

  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },

  successText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
