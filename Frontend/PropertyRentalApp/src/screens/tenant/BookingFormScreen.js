import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import DateTimePicker from '@react-native-community/datetimepicker'

import { addBooking } from '../../services/bookingService'
import { ThemeContext } from '../../provider/ThemeProvider'
import { SERVER_URL } from '../../utils/config'

// Helper arrays for safe cross-platform date formatting
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const BookingFormScreen = ({ route, navigation }) => {
  const { property } = route.params

  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)
  const imageUrl =
    property?.images?.length > 0
      ? `${SERVER_URL}/${property.images[0].imageUrl}`
      : null

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  )

  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    onClose: null,
  })

  useEffect(() => {
    console.log('Selected Property:', property)
    console.log('Property ID:', property?.propertyId)
  }, [])

  const showAlert = (title, message, type, onClose = null) => {
    setAlertConfig({ visible: true, title, message, type, onClose })
  }

  const closeAlert = () => {
    const { onClose } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onClose) onClose()
  }

  const onConfirmBooking = async () => {
    if (endDate <= startDate) {
      showAlert(
        'Invalid Dates',
        'Check-out date must be at least one day after Check-in date.',
        'warning'
      )
      return
    }

    const bookingRequest = {
      propertyId: property.propertyId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }

    try {
      await addBooking(bookingRequest)
      showAlert(
        'Booking Confirmed!',
        'Your booking request was submitted successfully.',
        'success',
        () => navigation.goBack()
      )
    } catch (error) {
      showAlert(
        'Booking Failed',
        error.response?.data?.message || 'Something went wrong while booking.',
        'error'
      )
    }
  }

  const getFormattedDate = dateObj => {
    return {
      day: dateObj.getDate().toString().padStart(2, '0'),
      month: MONTHS[dateObj.getMonth()],
      year: dateObj.getFullYear(),
      weekday: WEEKDAYS[dateObj.getDay()],
    }
  }

  const startFormatted = getFormattedDate(startDate)
  const endFormatted = getFormattedDate(endDate)

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success || '#10B981' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#EF4444' }
      default:
        return { icon: 'warning', color: COLORS.warning || '#F59E0B' }
    }
  }

  // Handle Date Changes safely for both platforms
  const onChangeDate = (event, selectedDate, isStart) => {
    if (Platform.OS === 'android') {
      if (isStart) setShowStartPicker(false)
      else setShowEndPicker(false)
    }

    if (selectedDate) {
      if (isStart) {
        setStartDate(selectedDate)
        if (endDate <= selectedDate) {
          const newEnd = new Date(selectedDate)
          newEnd.setDate(newEnd.getDate() + 1)
          setEndDate(newEnd)
        }
      } else {
        setEndDate(selectedDate)
      }
    }
  }

  // Helper for Indian Currency Formatting
  const formatCurrency = num => `₹${Number(num || 0).toLocaleString('en-IN')}`

  const nights = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background || '#F5F6FA'}
      />
      <View style={styles.container}>
        {/* Modern Floating Header */}
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
          <Text style={styles.headerTitle}>Request to Book</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Premium Property Summary Card */}
          <View style={styles.propertyCard}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.propertyImage}
            />
            <View style={styles.propertyImageOverlay} />
            <View style={styles.propertyDetails}>
              <View style={styles.propertyTypeBadge}>
                <Icon
                  name="villa"
                  size={11}
                  color={COLORS.primary || '#2563EB'}
                />
                <Text style={styles.propertySubText}>
                  {property?.propertyType || 'Property'}
                </Text>
              </View>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {property?.title || 'Property Name'}
              </Text>
              <View style={styles.locationRow}>
                <Icon
                  name="location-pin"
                  size={14}
                  color={COLORS.subText || '#6B7280'}
                />
                <Text style={styles.propertyLocation} numberOfLines={1}>
                  {property?.city || 'Location'}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Dates Selection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Trip Dates</Text>
            <Text style={styles.sectionSubTitle}>
              Select your check-in and check-out dates.
            </Text>
          </View>

          <View style={styles.calendarWidget}>
            {/* Check-in Selector */}
            <TouchableOpacity
              style={[styles.dateSelector, styles.dateSelectorStart]}
              activeOpacity={0.85}
              onPress={() => setShowStartPicker(true)}>
              <View style={styles.dateSelectorTopStripe} />
              <View style={styles.dateSelectorHeader}>
                <View style={styles.dateIconBubble}>
                  <Icon name="flight-takeoff" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.dateLabel}>Check-in</Text>
              </View>
              <Text style={styles.bigDateText}>{startFormatted.day}</Text>
              <Text style={styles.monthYearText}>
                {startFormatted.month} {startFormatted.year}
              </Text>
              <View style={styles.weekdayPill}>
                <Text style={styles.weekdayText}>{startFormatted.weekday}</Text>
              </View>
            </TouchableOpacity>

            {/* Floating Connection Arrow */}
            <View style={styles.widgetSeparator}>
              <View style={styles.nightsBadge}>
                <Text style={styles.nightsBadgeText}>{nights}</Text>
                <Text style={styles.nightsBadgeLabel}>
                  {nights === 1 ? 'night' : 'nights'}
                </Text>
              </View>
              <View style={styles.arrowCircle}>
                <Icon name="sync-alt" size={16} color="#FFFFFF" />
              </View>
            </View>

            {/* Check-out Selector */}
            <TouchableOpacity
              style={[styles.dateSelector, styles.dateSelectorEnd]}
              activeOpacity={0.85}
              onPress={() => setShowEndPicker(true)}>
              <View
                style={[
                  styles.dateSelectorTopStripe,
                  styles.dateSelectorTopStripeEnd,
                ]}
              />
              <View style={styles.dateSelectorHeader}>
                <View style={[styles.dateIconBubble, styles.dateIconBubbleEnd]}>
                  <Icon name="flight-land" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.dateLabel}>Check-out</Text>
              </View>
              <Text style={styles.bigDateText}>{endFormatted.day}</Text>
              <Text style={styles.monthYearText}>
                {endFormatted.month} {endFormatted.year}
              </Text>
              <View style={styles.weekdayPill}>
                <Text style={styles.weekdayText}>{endFormatted.weekday}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pricing Summary (Receipt Style) */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingTitleRow}>
              <Icon
                name="receipt-long"
                size={18}
                color={COLORS.primary || '#2563EB'}
              />
              <Text style={styles.pricingTitle}>Price Details</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Monthly Rent</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(property?.price)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Booking Duration</Text>
              <Text style={styles.pricingValue}>{nights} Days</Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomPriceLabel}>Total Amount</Text>
            <Text style={styles.bottomPriceValue}>
              {formatCurrency(property?.price)}
              <Text style={styles.bottomPriceMonth}> /mo</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.88}
            onPress={onConfirmBooking}>
            <View style={styles.confirmButtonShine} />
            <Text style={styles.confirmButtonText}>Confirm</Text>
            <View style={styles.confirmButtonIconWrap}>
              <Icon
                name="arrow-forward"
                size={18}
                color={COLORS.primary || '#2563EB'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- PLATFORM SPECIFIC CALENDAR POP-UPS --- */}
        {Platform.OS === 'ios' ? (
          <Modal
            transparent
            visible={showStartPicker || showEndPicker}
            animationType="slide">
            <View style={styles.iosPickerOverlay}>
              <View style={styles.iosPickerContainer}>
                <View style={styles.iosPickerHandle} />
                <View style={styles.iosPickerHeader}>
                  <View>
                    <Text style={styles.iosPickerHeaderLabel}>
                      {showStartPicker ? 'Select check-in' : 'Select check-out'}
                    </Text>
                    <Text style={styles.iosPickerHeaderSub}>
                      {showStartPicker
                        ? 'When does your stay begin?'
                        : 'When does your stay end?'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.iosPickerDoneWrap}
                    onPress={() => {
                      setShowStartPicker(false)
                      setShowEndPicker(false)
                    }}>
                    <Text style={styles.iosPickerDoneBtn}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={showStartPicker ? startDate : endDate}
                  mode="date"
                  display="inline"
                  minimumDate={showStartPicker ? new Date() : startDate}
                  onChange={(e, date) => onChangeDate(e, date, showStartPicker)}
                  style={styles.iosPicker}
                  accentColor={COLORS.primary || '#2563EB'}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(e, date) => onChangeDate(e, date, true)}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(e, date) => onChangeDate(e, date, false)}
              />
            )}
          </>
        )}

        {/* Custom Alert Modal */}
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

              <TouchableOpacity
                style={[
                  styles.alertButton,
                  { backgroundColor: getAlertStyle(alertConfig.type).color },
                ]}
                activeOpacity={0.85}
                onPress={closeAlert}>
                <Text style={styles.alertButtonText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

export default BookingFormScreen

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
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 40,
    },

    /* Modern Floating Header */
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

    /* Premium Property Card */
    propertyCard: {
      flexDirection: 'row',
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 24,
      padding: 14,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      marginBottom: 28,
      overflow: 'hidden',
    },
    propertyImage: {
      width: 96,
      height: 96,
      borderRadius: 18,
      backgroundColor: '#E5E7EB',
      marginRight: 16,
    },
    propertyImageOverlay: {
      display: 'none',
    },
    propertyDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    propertyTypeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: (COLORS.primary || '#2563EB') + '15',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 8,
    },
    propertySubText: {
      fontSize: 10,
      color: COLORS.primary || '#2563EB',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    propertyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 6,
      lineHeight: 22,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    propertyLocation: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      marginLeft: 4,
      flex: 1,
      fontWeight: '500',
    },

    /* Trip Dates Section */
    sectionHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 4,
    },
    sectionSubTitle: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Interactive Calendar Widget */
    calendarWidget: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      marginBottom: 28,
    },
    dateSelector: {
      flex: 1,
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 26,
      padding: 20,
      paddingTop: 24,
      alignItems: 'center',
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    dateSelectorStart: {},
    dateSelectorEnd: {},
    dateSelectorTopStripe: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 5,
      backgroundColor: COLORS.primary || '#2563EB',
    },
    dateSelectorTopStripeEnd: {
      backgroundColor: COLORS.success || '#10B981',
    },
    dateSelectorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
      gap: 6,
    },
    dateIconBubble: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: COLORS.primary || '#2563EB',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateIconBubbleEnd: {
      backgroundColor: COLORS.success || '#10B981',
    },
    dateLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bigDateText: {
      fontSize: 40,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 2,
      lineHeight: 44,
    },
    monthYearText: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 10,
    },
    weekdayPill: {
      backgroundColor: COLORS.background || '#F5F6FA',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    weekdayText: {
      fontSize: 12,
      color: COLORS.subText || '#6B7280',
      fontWeight: '700',
    },
    widgetSeparator: {
      width: 46,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nightsBadge: {
      position: 'absolute',
      top: -6,
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    nightsBadgeText: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
      lineHeight: 15,
    },
    nightsBadgeLabel: {
      fontSize: 8,
      fontWeight: '700',
      color: COLORS.subText || '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.primary || '#2563EB',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },

    /* Pricing Summary Card (Receipt Style) */
    pricingCard: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 22,
      padding: 20,
      marginBottom: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    pricingTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    pricingTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    pricingDivider: {
      height: 1,
      backgroundColor: COLORS.border || '#F3F4F6',
      marginBottom: 8,
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    pricingLabel: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },
    pricingValue: {
      fontSize: 15,
      color: COLORS.text || '#111827',
      fontWeight: '800',
    },

    /* Fixed Bottom Action Bar */
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.card || '#FFFFFF',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    bottomPriceContainer: {
      flex: 1,
    },
    bottomPriceLabel: {
      fontSize: 11,
      color: COLORS.subText || '#6B7280',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    bottomPriceValue: {
      fontSize: 25,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    bottomPriceMonth: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      fontWeight: '600',
    },
    confirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary || '#2563EB',
      paddingHorizontal: 26,
      paddingVertical: 17,
      borderRadius: 30,
      elevation: 6,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      gap: 10,
      overflow: 'hidden',
    },
    confirmButtonShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    confirmButtonIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* iOS Picker Modal Styles */
    iosPickerOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(17,24,39,0.55)',
    },
    iosPickerContainer: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingBottom: 34,
      paddingTop: 10,
    },
    iosPickerHandle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: COLORS.border || '#E5E7EB',
      alignSelf: 'center',
      marginBottom: 12,
    },
    iosPickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      paddingVertical: 12,
    },
    iosPickerHeaderLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    iosPickerHeaderSub: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
      marginTop: 2,
    },
    iosPickerDoneWrap: {
      backgroundColor: (COLORS.primary || '#2563EB') + '15',
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 18,
    },
    iosPickerDoneBtn: {
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
    },
    iosPicker: {
      height: 340,
      marginTop: 6,
    },

    /* Custom Alert Modal Styling */
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
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  })
