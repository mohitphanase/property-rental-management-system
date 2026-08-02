import React, { useEffect, useState } from 'react'
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
import COLORS from '../../theme/colors'
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
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      default:
        return { icon: 'warning', color: COLORS.warning }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Seamless Top Bar Header */}
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
          <Text style={styles.headerTitle}>Request to Book</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Compact Property Summary Card */}
          <View style={styles.propertyCard}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.propertyImage}
            />
            <View style={styles.propertyDetails}>
              <Text style={styles.propertySubText}>
                {property?.propertyType || 'Property'}
              </Text>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {property?.title || 'Property Name'}
              </Text>
              <View style={styles.locationRow}>
                <Icon name="location-pin" size={14} color={COLORS.subText} />
                <Text style={styles.propertyLocation} numberOfLines={1}>
                  {property?.city || 'Location'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Trip Dates Selection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Trip Dates</Text>
            <Text style={styles.sectionSubTitle}>
              Select when you want to move in.
            </Text>
          </View>

          <View style={styles.calendarWidget}>
            {/* Check-in Selector */}
            <TouchableOpacity
              style={styles.dateSelector}
              activeOpacity={0.7}
              onPress={() => setShowStartPicker(true)}>
              <View style={styles.dateSelectorHeader}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Icon name="edit-calendar" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.bigDateText}>{startFormatted.day}</Text>
              <Text style={styles.monthYearText}>
                {startFormatted.month} {startFormatted.year}
              </Text>
              <Text style={styles.weekdayText}>{startFormatted.weekday}</Text>
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.widgetSeparator}>
              <View style={styles.arrowCircle}>
                <Icon name="arrow-forward" size={16} color={COLORS.white} />
              </View>
            </View>

            {/* Check-out Selector */}
            <TouchableOpacity
              style={styles.dateSelector}
              activeOpacity={0.7}
              onPress={() => setShowEndPicker(true)}>
              <View style={styles.dateSelectorHeader}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Icon name="edit-calendar" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.bigDateText}>{endFormatted.day}</Text>
              <Text style={styles.monthYearText}>
                {endFormatted.month} {endFormatted.year}
              </Text>
              <Text style={styles.weekdayText}>{endFormatted.weekday}</Text>
            </TouchableOpacity>
          </View>

          {/* Pricing Summary */}
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Price Details</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Monthly Rent</Text>
              <Text style={styles.pricingValue}>₹{property?.price || '0'}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Booking Duration</Text>
              <Text style={styles.pricingValue}>
                {Math.max(
                  1,
                  Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                )}{' '}
                Days
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomPriceLabel}>Total Amount</Text>
            <Text style={styles.bottomPriceValue}>
              ₹{property?.price || '0'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.8}
            onPress={onConfirmBooking}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
            <Icon name="check-circle" size={20} color={COLORS.white} />
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
                <View style={styles.iosPickerHeader}>
                  <TouchableOpacity
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
                  accentColor={COLORS.primary}
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

              <TouchableOpacity
                style={[
                  styles.alertButton,
                  { backgroundColor: getAlertStyle(alertConfig.type).color },
                ]}
                activeOpacity={0.8}
                onPress={closeAlert}>
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

export default BookingFormScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Seamless Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 15 : 15,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    width: 42,
  },

  /* Compact Property Card */
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.disabled,
    marginRight: 14,
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  propertySubText: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyLocation: {
    fontSize: 13,
    color: COLORS.subText,
    marginLeft: 4,
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 24,
  },

  /* Trip Dates Section */
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubTitle: {
    fontSize: 14,
    color: COLORS.subText,
  },

  /* Interactive Calendar Widget */
  calendarWidget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateSelector: {
    flex: 1,
    backgroundColor: COLORS.primary + '10', // Soft primary tint
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  dateSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bigDateText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  monthYearText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  weekdayText: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
    fontWeight: '500',
  },
  widgetSeparator: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: 'absolute',
  },

  /* Pricing Summary Card */
  pricingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: COLORS.subText,
    fontWeight: '500',
  },
  pricingValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },

  /* Fixed Bottom Action Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bottomPriceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    gap: 8,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },

  /* iOS Picker Modal Styles */
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosPickerContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iosPickerDoneBtn: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  iosPicker: {
    height: 320,
    marginTop: 10,
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
    shadowColor: COLORS.shadow,
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
})
