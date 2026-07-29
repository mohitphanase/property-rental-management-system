import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

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

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'confirm'
    onConfirm: null,
    onClose: null,
  })

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

  const onPayNow = () => {
    navigation.navigate('PaymentScreen', {
      booking,
      property,
      amount: property?.price,
    })
  }

  // --- Custom Alert Logic ---
  const closeAlert = () => {
    const { onClose } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onClose) onClose()
  }

  const handleConfirmAction = () => {
    const { onConfirm } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onConfirm) onConfirm()
  }

  const onCancelBooking = () => {
    setAlertConfig({
      visible: true,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteBooking(booking.bookingId)
          setTimeout(() => {
            setAlertConfig({
              visible: true,
              title: 'Success',
              message: 'Booking cancelled successfully.',
              type: 'success',
              onClose: () => navigation.pop(2),
            })
          }, 400)
        } catch (error) {
          console.log(error.response?.data)
          setTimeout(() => {
            setAlertConfig({
              visible: true,
              title: 'Error',
              message: 'Unable to cancel booking.',
              type: 'error',
            })
          }, 400)
        }
      },
    })
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success || '#28A745' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#DC3545' }
      case 'confirm':
        return { icon: 'help-outline', color: COLORS.warning || '#F5A623' }
      default:
        return { icon: 'info', color: COLORS.primary || '#007BFF' }
    }
  }

  // --- Status UI Logic ---
  const getStatusStyle = status => {
    switch (status) {
      case 'APPROVED':
        return styles.approvedBadge
      case 'REJECTED':
        return styles.rejectedBadge
      case 'CANCELLED':
        return styles.cancelledBadge
      default:
        return styles.pendingBadge
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'APPROVED':
        return 'check-circle'
      case 'REJECTED':
        return 'cancel'
      case 'CANCELLED':
        return 'block'
      default:
        return 'hourglass-empty'
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Top Bar with added margin/padding for the status bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back-ios"
            size={20}
            color={COLORS.text || '#212529'}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Property Overview Card */}
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
            <Text style={styles.propertyName} numberOfLines={1}>
              {property?.title || property?.propertyName || 'Loading...'}
            </Text>

            <View style={styles.locationRow}>
              <Icon
                name="location-on"
                size={14}
                color={COLORS.primary || '#007BFF'}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {property?.city || property?.location || 'Unknown Location'}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Rent:{' '}
                <Text style={styles.totalAmount}>
                  ₹{property?.price ?? property?.rent ?? '0'}/mo
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Booking ID</Text>
              <Text style={styles.value}>#{booking.bookingId}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Booking Date</Text>
              <Text style={styles.value}>{booking.createdAt}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Start Date</Text>
              <Text style={[styles.value, styles.dateHighlight]}>
                {booking.startDate}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>End Date</Text>
              <Text style={[styles.value, styles.dateHighlight]}>
                {booking.endDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={[styles.statusBanner, getStatusStyle(booking.status)]}>
            <Icon
              name={getStatusIcon(booking.status)}
              size={24}
              color="#fff"
              style={styles.statusIcon}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusBannerTitle}>
                {booking.status.charAt(0) +
                  booking.status.slice(1).toLowerCase()}
              </Text>
              <Text style={styles.statusBannerSubtitle}>
                {booking.status === 'APPROVED'
                  ? 'The owner has approved your request.'
                  : booking.status === 'REJECTED'
                    ? 'The owner declined this booking.'
                    : booking.status === 'CANCELLED'
                      ? 'You cancelled this booking.'
                      : 'Waiting for the owner to review.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isPaid ? (
            <View style={styles.successBox}>
              <Icon
                name="verified"
                size={24}
                color={COLORS.success || '#28A745'}
              />
              <Text style={styles.successText}>
                Payment Completed Successfully
              </Text>
            </View>
          ) : booking.status === 'APPROVED' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.payButton}
              onPress={onPayNow}>
              <Icon
                name="payment"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Proceed to Payment</Text>
            </TouchableOpacity>
          ) : null}

          {booking.status !== 'REJECTED' &&
            booking.status !== 'CANCELLED' &&
            !isPaid && (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.cancelButton}
                onPress={onCancelBooking}>
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor: getAlertStyle(alertConfig.type).color + '15',
                },
              ]}>
              <Icon
                name={getAlertStyle(alertConfig.type).icon}
                size={38}
                color={getAlertStyle(alertConfig.type).color}
              />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            {alertConfig.type === 'confirm' ? (
              <View style={styles.alertButtonRow}>
                <TouchableOpacity
                  style={styles.alertCancelBtn}
                  activeOpacity={0.7}
                  onPress={closeAlert}>
                  <Text style={styles.alertCancelBtnText}>Keep it</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.alertConfirmBtn}
                  activeOpacity={0.7}
                  onPress={handleConfirmAction}>
                  <Text style={styles.alertConfirmBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  { backgroundColor: getAlertStyle(alertConfig.type).color },
                ]}
                activeOpacity={0.8}
                onPress={closeAlert}>
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },

  /* Top Bar Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    // Added padding top dynamically so the header safely clears the notification bar on Android
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 15 : 15,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF', // Soft border matching the image
  },
  backIcon: {
    marginLeft: 6, // centers the iOS arrow visually
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || '#111827', // Darker text color matching the image
  },
  headerSpacer: {
    width: 45, // balances the back button width to perfectly center the title
  },

  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Property Card */
  propertyCard: {
    backgroundColor: COLORS.card || '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  propertyImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.placeholder || '#E9ECEF',
    marginRight: 15,
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || '#212529',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.subText || '#6C757D',
    marginLeft: 4,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.subText || '#6C757D',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary || '#007BFF',
  },

  /* Details Section */
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || '#212529',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: COLORS.card || '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#F1F3F5',
  },
  label: {
    fontSize: 14,
    color: COLORS.subText || '#868E96',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text || '#343A40',
  },
  dateHighlight: {
    color: COLORS.primary || '#007BFF',
    fontWeight: '500',
  },

  /* Status Banner */
  statusBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIcon: {
    marginRight: 15,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusBannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  approvedBadge: {
    backgroundColor: COLORS.success || '#28A745',
  },
  pendingBadge: {
    backgroundColor: '#F59E0B', // Matched to the exact orange in the image
  },
  rejectedBadge: {
    backgroundColor: COLORS.error || '#DC3545',
  },
  cancelledBadge: {
    backgroundColor: COLORS.cancelled || '#6C757D',
  },

  /* Action Buttons */
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: COLORS.primary || '#007BFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: '#EF4444', // Matched to the red in the image
    backgroundColor: '#FFFFFF', // Ensured background is white like in image
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelButtonText: {
    color: '#EF4444', // Matched to the red in the image
    fontSize: 15,
    fontWeight: '600',
  },

  /* Status Message Boxes */
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },
  successText: {
    color: COLORS.success || '#28A745',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  /* Custom Alert Modal Styling */
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  alertIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 15,
    color: COLORS.subText || '#6C757D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  alertButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  alertCancelBtnText: {
    color: COLORS.text || '#212529',
    fontSize: 16,
    fontWeight: '700',
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.error || '#DC3545',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.error || '#DC3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  alertConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
