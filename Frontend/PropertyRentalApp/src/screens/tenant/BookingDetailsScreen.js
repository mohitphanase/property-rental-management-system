import React, { useEffect, useState, useContext } from 'react'
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
import { getPropertyById } from '../../services/propertyServicet'
import { getPaymentByBooking } from '../../services/paymentService'
import { deleteBooking } from '../../services/bookingService'
import { ThemeContext } from '../../provider/ThemeProvider'

export default function BookingDetailsScreen({ route, navigation }) {
  const { booking } = route.params

  const [property, setProperty] = useState(null)
  const [propertyImage, setPropertyImage] = useState(null)
  const [isPaid, setIsPaid] = useState(false)

  // Pulling dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
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
      console.log('=== loadProperty Error ===', error)
    }
  }

  const loadPropertyImage = async () => {
    try {
      const response = await getPropertyImages(booking.propertyId)
      if (response.data.data.length > 0) {
        setPropertyImage(response.data.data[0].imageUrl)
      }
    } catch (error) {
      console.log('=== loadPropertyImage Error ===', error)
    }
  }

  const checkPayment = async () => {
    try {
      const response = await getPaymentByBooking(booking.bookingId)
      if (response.data.status === 'success' && response.data.data) {
        setIsPaid(true)
      }
    } catch (error) {
      console.log('=== checkPayment Error ===', error)
    }
  }

  const onPayNow = () => {
    navigation.navigate('PaymentScreen', {
      booking,
      property,
      amount: property?.price,
    })
  }

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
              title: 'Cancelled',
              message: 'Booking cancelled successfully.',
              type: 'success',
              onClose: () => navigation.pop(2),
            })
          }, 400)
        } catch (error) {
          setTimeout(() => {
            setAlertConfig({
              visible: true,
              title: 'Error',
              message: 'Unable to cancel booking at this time.',
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
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      case 'confirm':
        return { icon: 'help-outline', color: COLORS.warning }
      default:
        return { icon: 'info', color: COLORS.primary }
    }
  }

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
      <View style={styles.container}>
        {/* Seamless Fixed Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back-ios"
              size={18}
              color={COLORS.text}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Summary</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Property Overview Card */}
          <View style={styles.propertyCard}>
            <Image
              source={
                propertyImage
                  ? { uri: `${SERVER_URL}/${propertyImage}` }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.propertyImage}
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName} numberOfLines={2}>
                {property?.title ||
                  property?.propertyName ||
                  'Loading Property...'}
              </Text>

              <View style={styles.locationRow}>
                <Icon name="location-on" size={16} color={COLORS.subText} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {property?.city || property?.location || 'Location details'}
                </Text>
              </View>

              <View style={styles.pricePill}>
                <Text style={styles.priceLabel}>
                  ₹{property?.price ?? property?.rent ?? '0'}{' '}
                  <Text style={styles.priceMonth}>/mo</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Ticket Style Booking Details */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.ticketCard}>
              <View style={styles.ticketRow}>
                <View>
                  <Text style={styles.label}>Booking ID</Text>
                  <Text style={styles.value}>#{booking.bookingId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Date Applied</Text>
                  <Text style={styles.value}>{booking.createdAt}</Text>
                </View>
              </View>

              {/* Dashed Line Separator */}
              <View style={styles.dashedDivider} />

              <View style={styles.ticketRow}>
                <View style={styles.dateBox}>
                  <Icon
                    name="event-available"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.label}>Check In</Text>
                  <Text style={styles.dateHighlight}>{booking.startDate}</Text>
                </View>

                <Icon name="arrow-forward" size={20} color={COLORS.border} />

                <View style={styles.dateBox}>
                  <Icon
                    name="event-busy"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.label}>Check Out</Text>
                  <Text style={styles.dateHighlight}>{booking.endDate}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={[styles.statusBanner, getStatusStyle(booking.status)]}>
              <View style={styles.statusIconWrapper}>
                <Icon
                  name={getStatusIcon(booking.status)}
                  size={28}
                  color={COLORS.white}
                />
              </View>
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

          {/* Bottom Action Buttons */}
          <View style={styles.actionContainer}>
            {isPaid ? (
              <View style={styles.successBox}>
                <Icon name="verified" size={24} color={COLORS.success} />
                <Text style={styles.successText}>
                  Payment Completed Successfully
                </Text>
              </View>
            ) : booking.status === 'APPROVED' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.payButton}
                onPress={onPayNow}>
                <Text style={styles.payButtonText}>Proceed to Payment</Text>
                <Icon name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            ) : null}

            {booking.status !== 'REJECTED' &&
              booking.status !== 'CANCELLED' &&
              !isPaid && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.cancelButtonSoft}
                  onPress={onCancelBooking}>
                  <Text style={styles.cancelButtonSoftText}>
                    Cancel Booking
                  </Text>
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
                    backgroundColor:
                      getAlertStyle(alertConfig.type).color + '15',
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
      </View>
    </SafeAreaView>
  )
}

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background, // Fixed Hardcode
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background, // Fixed Hardcode
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: 5,
      paddingBottom: 40,
    },

    /* Seamless Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 15,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 15 : 15,
      backgroundColor: COLORS.background, // Fixed Hardcode
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    backIcon: {
      marginLeft: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      letterSpacing: 0.3,
    },
    headerSpacer: {
      width: 44,
    },

    /* Premium Property Card */
    propertyCard: {
      backgroundColor: COLORS.card,
      marginHorizontal: 16,
      marginBottom: 24,
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 4,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    propertyImage: {
      width: 100,
      height: 100,
      borderRadius: 14,
      backgroundColor: COLORS.disabled || COLORS.border,
      marginRight: 16,
    },
    propertyInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    propertyName: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 6,
      lineHeight: 22,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    locationText: {
      fontSize: 13,
      color: COLORS.subText,
      marginLeft: 4,
      flex: 1,
      fontWeight: '500',
    },
    pricePill: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    priceLabel: {
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.primary,
    },
    priceMonth: {
      fontSize: 12,
      fontWeight: '600',
    },

    /* Section Styles */
    sectionContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text,
      marginHorizontal: 20,
      marginBottom: 12,
    },

    /* Ticket Style Details Card */
    ticketCard: {
      backgroundColor: COLORS.card,
      marginHorizontal: 16,
      borderRadius: 20,
      padding: 20,
      elevation: 3,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    ticketRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateBox: {
      alignItems: 'center',
      flex: 1,
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginVertical: 18,
    },
    label: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
    },
    dateHighlight: {
      fontSize: 15,
      color: COLORS.text,
      fontWeight: '800',
      marginTop: 2,
    },

    /* Glowing Status Banner */
    statusBanner: {
      marginHorizontal: 16,
      borderRadius: 20,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 5,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    statusIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    statusTextContainer: {
      flex: 1,
    },
    statusBannerTitle: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    statusBannerSubtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    approvedBadge: {
      backgroundColor: COLORS.success,
      shadowColor: COLORS.success,
    },
    pendingBadge: {
      backgroundColor: COLORS.warning,
      shadowColor: COLORS.warning,
    },
    rejectedBadge: {
      backgroundColor: COLORS.error,
      shadowColor: COLORS.error,
    },
    cancelledBadge: {
      backgroundColor: COLORS.cancelled,
      shadowColor: COLORS.cancelled,
    },

    /* Modern Action Buttons */
    actionContainer: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    payButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      paddingHorizontal: 24,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 16,
      elevation: 6,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    payButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    cancelButtonSoft: {
      backgroundColor: COLORS.error + '15', // Fixed Hardcode (tinted background)
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    cancelButtonSoftText: {
      color: COLORS.error,
      fontSize: 15,
      fontWeight: '700',
    },

    /* Success Box */
    successBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.success + '15', // Fixed Hardcode
      borderWidth: 1,
      borderColor: COLORS.success + '40', // Fixed Hardcode
      padding: 18,
      borderRadius: 16,
      marginBottom: 16,
    },
    successText: {
      color: COLORS.success,
      fontSize: 15,
      fontWeight: '700',
      marginLeft: 10,
    },

    /* Custom Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: 28,
      padding: 24,
      alignItems: 'center',
      elevation: 10,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    alertIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    alertTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 15,
      color: COLORS.subText,
      textAlign: 'center',
      marginBottom: 28,
      lineHeight: 22,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    alertButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '800',
    },
    alertButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    alertCancelBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
    },
    alertCancelBtnText: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: '700',
    },
    alertConfirmBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.error,
      alignItems: 'center',
      elevation: 3,
      shadowColor: COLORS.error,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    alertConfirmBtnText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: '800',
    },
  })
