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
import COLORS from '../../theme/colors'

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
            <Text style={styles.label}>Location: </Text>
            {property?.city || property?.location}
          </Text>

          <Text style={styles.label}>Booking Period:</Text>
          <Text style={styles.value}>
            {booking.startDate} - {booking.endDate}
          </Text>
          <Text style={styles.label}>Rent:</Text>
          <Text style={styles.totalAmount}>
            ₹{property?.price ?? property?.rent}
          </Text>

          <Text style={styles.label}>Status:</Text>

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
      ) : booking.status === 'REJECTED' ? (
        <View style={styles.rejectedBox}>
          <Text style={styles.rejectedText}>❌ Booking Rejected by Owner</Text>
        </View>
      ) : booking.status === 'CANCELLED' ? (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>🚫 Booking Cancelled</Text>
        </View>
      ) : (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>⏳ Waiting for owner approval.</Text>
        </View>
      )}

      {booking.status !== 'REJECTED' && booking.status !== 'CANCELLED' && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancelBooking}>
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  propertyCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',

    elevation: 5,
    shadowColor: COLORS.shadow,
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
    backgroundColor: COLORS.placeholder,
    marginRight: 15,
  },

  propertyInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  location: {
    fontSize: 14,
    color: COLORS.subText,
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
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },

  approved: {
    backgroundColor: COLORS.success,
  },

  pending: {
    backgroundColor: COLORS.warning,
  },

  rejected: {
    backgroundColor: COLORS.error,
  },

  cancelled: {
    backgroundColor: COLORS.cancelled,
  },

  detailsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,

    elevation: 5,
    shadowColor: COLORS.shadow,
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
    borderBottomColor: COLORS.border,
  },

  label: {
    fontSize: 15,
    color: COLORS.subText,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  paymentCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,

    elevation: 5,
    shadowColor: COLORS.shadow,
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
    color: COLORS.text,
    marginBottom: 15,
  },

  payButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: COLORS.white,
  },

  cancelButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: 'bold',
  },

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

  successBox: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },

  successText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rejectedBox: {
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FDECEC',
    padding: 15,
    borderRadius: 12,
  },

  rejectedText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
})
