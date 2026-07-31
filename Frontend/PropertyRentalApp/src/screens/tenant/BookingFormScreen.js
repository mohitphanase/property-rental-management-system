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
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import DateTimePicker from '@react-native-community/datetimepicker'

import { addBooking } from '../../services/bookingService'
import COLORS from '../../theme/colors'

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
        'Your booking was created successfully.',
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
        return { icon: 'check-circle', color: COLORS.success || '#28A745' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#DC3545' }
      default:
        return { icon: 'warning', color: COLORS.warning || '#F5A623' }
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
      {/* Fixed Top Bar Header */}
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
        <Text style={styles.headerTitle}>Book Your Stay</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Property Details Card */}
        <View style={styles.propertyCard}>
          <View style={styles.headerRow}>
            <Text style={styles.propertyTitle} numberOfLines={2}>
              {property?.title || 'Property Name'}
            </Text>
            <View style={styles.typeChip}>
              <Icon name="home" size={16} color={COLORS.primary || '#007BFF'} />
              <Text style={styles.typeText}>
                {property?.propertyType || 'Type'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon
              name="location-on"
              size={18}
              color={COLORS.subText || '#6C757D'}
            />
            <Text style={styles.propertyInfo}>
              {property?.city || 'Location'}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={3}>
            {property?.description || 'No description provided.'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Monthly Rent</Text>
            <Text style={styles.propertyPrice}>₹{property?.price || '0'}</Text>
          </View>
        </View>

        {/* Interactive Calendar Style Date Selection */}
        <Text style={styles.sectionTitle}>Select Dates</Text>

        <View style={styles.calendarCard}>
          {/* Check-in Box */}
          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.7}
            onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.bigDateText}>{startFormatted.day}</Text>
            <Text style={styles.dateSubText}>
              {startFormatted.weekday}, {startFormatted.month}{' '}
              {startFormatted.year}
            </Text>
          </TouchableOpacity>

          {/* Center Divider with Arrow */}
          <View style={styles.calendarDividerContainer}>
            <View style={styles.verticalLine} />
            <View style={styles.arrowCircle}>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.verticalLine} />
          </View>

          {/* Check-out Box */}
          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.7}
            onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.bigDateText}>{endFormatted.day}</Text>
            <Text style={styles.dateSubText}>
              {endFormatted.weekday}, {endFormatted.month} {endFormatted.year}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={onConfirmBooking}>
          <Text style={styles.buttonText}>Confirm Booking</Text>
          <Icon name="check-circle-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

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
                display="inline" // This triggers the nice visual calendar UI on iOS 14+
                minimumDate={showStartPicker ? new Date() : startDate}
                onChange={(e, date) => onChangeDate(e, date, showStartPicker)}
                style={styles.iosPicker}
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
              display="default" // Default on Android opens the standard calendar dialog pop-up
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
    </SafeAreaView>
  )
}

export default BookingFormScreen

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
    borderColor: '#E9ECEF',
  },
  backIcon: {
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || '#111827',
  },
  headerSpacer: {
    width: 45,
  },

  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Property Card */
  propertyCard: {
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  propertyTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginRight: 10,
    lineHeight: 28,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (COLORS.primary || '#007BFF') + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary || '#007BFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyInfo: {
    fontSize: 15,
    color: COLORS.subText || '#6C757D',
    marginLeft: 6,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: COLORS.subText || '#868E96',
    lineHeight: 22,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#E9ECEF',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    color: COLORS.subText || '#6C757D',
    fontWeight: '600',
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary || '#007BFF',
  },

  /* Calendar Card Styles */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text || '#212529',
    marginBottom: 15,
    marginLeft: 4,
  },
  calendarCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 35,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.subText || '#6C757D',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bigDateText: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.primary || '#007BFF',
    marginBottom: 2,
  },
  dateSubText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text || '#212529',
  },
  calendarDividerContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#E9ECEF',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary || '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  /* Action Button */
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary || '#007BFF',
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 0.5,
  },

  /* iOS Picker Modal Styles */
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30, // Safe area for newer iPhones
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  iosPickerDoneBtn: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary || '#007BFF',
  },
  iosPicker: {
    height: 320,
    marginTop: 10,
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
  },
})
