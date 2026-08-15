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
  Linking,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { getPropertyImages } from '../../services/propertyImageService'
import { SERVER_URL } from '../../utils/config'
import { getPropertyById } from '../../services/propertyServicet'
import { deleteBooking } from '../../services/bookingService'
import { ThemeContext } from '../../provider/ThemeProvider'

export default function BookingDetailsScreen({ route, navigation }) {
  const { booking } = route.params

  const [property, setProperty] = useState(null)
  const [propertyImage, setPropertyImage] = useState(null)

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

  // --- Actions ---
  const onContactOwner = () => {
    if (!property?.ownerPhone) {
      setAlertConfig({
        visible: true,
        title: 'Not Available',
        message: 'The owner has not provided a contact number.',
        type: 'warning',
      })
      return
    }

    setAlertConfig({
      visible: true,
      title: 'Contact Owner',
      message: `Would you like to call ${property.ownerName || 'the property owner'}?\n\n📞 +91 ${property.ownerPhone}`,
      type: 'confirm-call',
      onConfirm: () => {
        Linking.openURL(`tel:${property.ownerPhone}`)
      },
    })
  }

  const onRentDetails = () => {
    navigation.navigate('PaymentScreen', {
      booking,
      property,
      amount: property?.price,
    })
  }

  const onCancelBooking = () => {
    setAlertConfig({
      visible: true,
      title: 'Cancel Booking',
      message:
        'Are you sure you want to cancel this booking? This action cannot be undone.',
      type: 'confirm-cancel',
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
        return { icon: 'check-circle', color: COLORS.success || '#10B981' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#EF4444' }
      case 'confirm-cancel':
        return { icon: 'help-outline', color: COLORS.error || '#EF4444' }
      case 'confirm-call':
        return { icon: 'phone-in-talk', color: COLORS.primary || '#2563EB' }
      default:
        return { icon: 'info', color: COLORS.primary || '#2563EB' }
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background || '#F5F6FA'}
      />
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              size={22}
              color={COLORS.text || '#111827'}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Summary</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Glowing Status Banner */}
          <View style={[styles.statusBanner, getStatusStyle(booking.status)]}>
            <View style={styles.statusBannerShine} />
            <View style={styles.statusIconWrapper}>
              <Icon
                name={getStatusIcon(booking.status)}
                size={26}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusBannerTitle}>
                {booking.status.charAt(0) +
                  booking.status.slice(1).toLowerCase()}
              </Text>
              <Text style={styles.statusBannerSubtitle}>
                {booking.status === 'APPROVED'
                  ? 'The owner has approved your stay.'
                  : booking.status === 'REJECTED'
                    ? 'The owner declined this request.'
                    : booking.status === 'CANCELLED'
                      ? 'You have cancelled this booking.'
                      : 'Waiting for the owner to review.'}
              </Text>
            </View>
          </View>

          {/* Premium Property Card */}
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
                <Icon
                  name="location-on"
                  size={16}
                  color={COLORS.subText || '#6B7280'}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {property?.city || property?.location || 'Location details'}
                </Text>
              </View>

              <View style={styles.pricePill}>
                <Text style={styles.priceLabel}>
                  ₹
                  {Number(
                    property?.price ?? property?.rent ?? 0
                  ).toLocaleString('en-IN')}
                  <Text style={styles.priceMonth}> /mo</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Authentic Ticket Details */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <Icon
                name="confirmation-number"
                size={18}
                color={COLORS.primary || '#2563EB'}
              />
              <Text style={styles.sectionTitle}>Trip Details</Text>
            </View>
            <View style={styles.ticketCard}>
              <View style={styles.ticketTop}>
                <View>
                  <Text style={styles.label}>Booking ID</Text>
                  <Text style={styles.value}>#{booking.bookingId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Date Applied</Text>
                  <Text style={styles.value}>
                    {booking.createdAt?.split(' ')[0] || booking.createdAt}
                  </Text>
                </View>
              </View>

              {/* Dashed Line with Notches */}
              <View style={styles.ticketDividerContainer}>
                <View style={styles.notchLeft} />
                <View style={styles.dashedDivider} />
                <View style={styles.notchRight} />
              </View>

              <View style={styles.ticketBottom}>
                <View style={styles.dateBox}>
                  <View style={styles.dateIconWrapper}>
                    <Icon
                      name="login"
                      size={18}
                      color={COLORS.primary || '#2563EB'}
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>Check In</Text>
                    <Text style={styles.dateHighlight}>
                      {booking.startDate}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateDivider} />

                <View style={styles.dateBox}>
                  <View
                    style={[
                      styles.dateIconWrapper,
                      { backgroundColor: (COLORS.error || '#EF4444') + '15' },
                    ]}>
                    <Icon
                      name="logout"
                      size={18}
                      color={COLORS.error || '#EF4444'}
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>Check Out</Text>
                    <Text style={styles.dateHighlight}>{booking.endDate}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Dynamic Action Center */}
          <View style={styles.actionContainer}>
            {booking.status === 'APPROVED' && (
              <View style={styles.approvedActionRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.primaryActionBtn}
                  onPress={onContactOwner}>
                  <Icon name="phone" size={19} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>Contact Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.secondaryActionBtn}
                  onPress={onRentDetails}>
                  <Icon
                    name="receipt-long"
                    size={19}
                    color={COLORS.primary || '#2563EB'}
                  />
                  <Text style={styles.secondaryActionText}>Rent Details</Text>
                </TouchableOpacity>
              </View>
            )}

            {(booking.status === 'REJECTED' ||
              booking.status === 'CANCELLED') && (
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.exploreBtn}
                onPress={() =>
                  navigation.navigate('TenantTabs', { screen: 'Home' })
                }>
                <Icon name="search" size={19} color="#FFFFFF" />
                <Text style={styles.exploreBtnText}>
                  Find Similar Properties
                </Text>
              </TouchableOpacity>
            )}

            {(booking.status === 'PENDING' ||
              booking.status === 'APPROVED') && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.cancelButtonSoft}
                onPress={onCancelBooking}>
                <Icon
                  name="close"
                  size={16}
                  color={COLORS.error || '#EF4444'}
                />
                <Text style={styles.cancelButtonSoftText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Enhanced Custom Alert Modal */}
        <Modal transparent visible={alertConfig.visible} animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <View
                style={[
                  styles.alertIconContainer,
                  {
                    backgroundColor:
                      getAlertStyle(alertConfig.type).color + '1A',
                  },
                ]}>
                <Icon
                  name={getAlertStyle(alertConfig.type).icon}
                  size={36}
                  color={getAlertStyle(alertConfig.type).color}
                />
              </View>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>

              {alertConfig.type.startsWith('confirm') ? (
                <View style={styles.alertButtonRow}>
                  <TouchableOpacity
                    style={styles.alertCancelBtn}
                    activeOpacity={0.8}
                    onPress={closeAlert}>
                    <Text style={styles.alertCancelBtnText}>
                      {alertConfig.type === 'confirm-call'
                        ? 'Cancel'
                        : 'Keep Booking'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.alertConfirmBtn,
                      {
                        backgroundColor: getAlertStyle(alertConfig.type).color,
                      },
                    ]}
                    activeOpacity={0.88}
                    onPress={handleConfirmAction}>
                    <Text style={styles.alertConfirmBtnText}>
                      {alertConfig.type === 'confirm-call'
                        ? 'Call Now'
                        : 'Yes, Cancel'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.alertButton,
                    { backgroundColor: getAlertStyle(alertConfig.type).color },
                  ]}
                  activeOpacity={0.88}
                  onPress={closeAlert}>
                  <Text style={styles.alertButtonText}>Got It</Text>
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
      backgroundColor: COLORS.background || '#F5F6FA',
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background || '#F5F6FA',
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 40,
    },

    /* Modern Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
      backgroundColor: COLORS.background || '#F5F6FA',
    },
    backButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: COLORS.card || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    headerTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      letterSpacing: 0.2,
    },
    headerSpacer: {
      width: 46,
    },

    /* Glowing Status Banner */
    statusBanner: {
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 26,
      borderRadius: 24,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 7,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      overflow: 'hidden',
    },
    statusBannerShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '55%',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    statusIconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    statusTextContainer: {
      flex: 1,
    },
    statusBannerTitle: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: '800',
      marginBottom: 3,
    },
    statusBannerSubtitle: {
      color: 'rgba(255, 255, 255, 0.92)',
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    approvedBadge: {
      backgroundColor: COLORS.success || '#10B981',
      shadowColor: COLORS.success || '#10B981',
    },
    pendingBadge: {
      backgroundColor: COLORS.warning || '#F59E0B',
      shadowColor: COLORS.warning || '#F59E0B',
    },
    rejectedBadge: {
      backgroundColor: COLORS.error || '#EF4444',
      shadowColor: COLORS.error || '#EF4444',
    },
    cancelledBadge: {
      backgroundColor: COLORS.cancelled || '#6B7280',
      shadowColor: '#000',
    },

    /* Premium Property Card */
    propertyCard: {
      backgroundColor: COLORS.card || '#FFFFFF',
      marginHorizontal: 16,
      marginBottom: 28,
      borderRadius: 26,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
    },
    propertyImage: {
      width: 100,
      height: 100,
      borderRadius: 18,
      backgroundColor: '#E5E7EB',
      marginRight: 16,
    },
    propertyInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    propertyName: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text || '#111827',
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
      color: COLORS.subText || '#6B7280',
      marginLeft: 4,
      flex: 1,
      fontWeight: '500',
    },
    pricePill: {
      alignSelf: 'flex-start',
      backgroundColor: (COLORS.primary || '#2563EB') + '12',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
    },
    priceLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
    },
    priceMonth: {
      fontSize: 12,
      fontWeight: '600',
    },

    /* Section Styles */
    sectionContainer: {
      marginBottom: 24,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },

    /* Authentic Ticket Details Card */
    ticketCard: {
      backgroundColor: COLORS.card || '#FFFFFF',
      marginHorizontal: 16,
      borderRadius: 26,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      overflow: 'hidden',
    },
    ticketTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      paddingBottom: 16,
    },
    ticketDividerContainer: {
      position: 'relative',
      height: 24,
      justifyContent: 'center',
    },
    notchLeft: {
      position: 'absolute',
      left: -12,
      top: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: COLORS.background || '#F5F6FA',
      zIndex: 1,
    },
    notchRight: {
      position: 'absolute',
      right: -12,
      top: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: COLORS.background || '#F5F6FA',
      zIndex: 1,
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      borderStyle: 'dashed',
      marginHorizontal: 16,
    },
    ticketBottom: {
      flexDirection: 'row',
      padding: 20,
      paddingTop: 16,
    },
    dateBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateIconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: (COLORS.primary || '#2563EB') + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    dateDivider: {
      width: 1,
      backgroundColor: COLORS.border || '#F3F4F6',
      marginHorizontal: 12,
    },
    label: {
      fontSize: 11,
      color: COLORS.subText || '#6B7280',
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    dateHighlight: {
      fontSize: 14,
      color: COLORS.text || '#111827',
      fontWeight: '800',
    },

    /* Action Center */
    actionContainer: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    approvedActionRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    primaryActionBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: COLORS.primary || '#2563EB',
      borderRadius: 24,
      paddingVertical: 17,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      gap: 8,
    },
    primaryActionText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryActionBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      borderRadius: 24,
      paddingVertical: 17,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    secondaryActionText: {
      color: COLORS.primary || '#2563EB',
      fontSize: 15,
      fontWeight: '800',
    },
    exploreBtn: {
      flexDirection: 'row',
      backgroundColor: COLORS.primary || '#2563EB',
      borderRadius: 24,
      paddingVertical: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      elevation: 5,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      gap: 8,
    },
    exploreBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    cancelButtonSoft: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: (COLORS.error || '#EF4444') + '08',
      borderRadius: 24,
      paddingVertical: 16,
      marginBottom: 16,
    },
    cancelButtonSoftText: {
      color: COLORS.error || '#EF4444',
      fontSize: 15,
      fontWeight: '800',
    },

    /* Custom Alert Modal */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(17,24,39,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 30,
      padding: 26,
      alignItems: 'center',
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
    },
    alertIconContainer: {
      width: 76,
      height: 76,
      borderRadius: 38,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 10,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      textAlign: 'center',
      marginBottom: 28,
      lineHeight: 22,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
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
      paddingVertical: 15,
      borderRadius: 18,
      backgroundColor: COLORS.background || '#F5F6FA',
      alignItems: 'center',
    },
    alertCancelBtnText: {
      color: COLORS.text || '#111827',
      fontSize: 14,
      fontWeight: '800',
    },
    alertConfirmBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 18,
      alignItems: 'center',
      elevation: 3,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    alertConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  })
