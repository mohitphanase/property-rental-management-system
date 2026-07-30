import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { addPayment } from '../../services/paymentService'
import COLORS from '../../theme/colors'

export default function PaymentScreen({ route, navigation }) {
  const { booking, property, amount } = route.params

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning', // 'success' | 'error' | 'warning'
    onClose: null,
  })

  // Custom Alert Handlers
  const showAlert = (title, message, type, onClose = null) => {
    setAlertConfig({ visible: true, title, message, type, onClose })
  }

  const closeAlert = () => {
    const { onClose } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onClose) {
      onClose()
    }
  }

  const onCashPayment = async () => {
    try {
      const response = await addPayment(booking.bookingId, amount)
      console.log('Payment Response:', response.data)

      showAlert(
        'Payment Successful',
        'Your payment has been completed successfully.',
        'success',
        () => navigation.pop(2)
      )
    } catch (error) {
      console.log('Error:', error.response?.data)
      console.log('Status:', error.response?.status)
      console.log('Message:', error.message)

      showAlert(
        'Payment Failed',
        error.response?.data?.message ||
          'Unable to process payment at this time.',
        'error'
      )
    }
  }

  const onOnlinePayment = () => {
    showAlert(
      'Under Maintenance',
      'Online Payment is currently unavailable. Please use Cash Payment.',
      'warning'
    )
  }

  // Helper for alert styles
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Property Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon
              name="receipt-long"
              size={24}
              color={COLORS.primary || '#007BFF'}
            />
            <Text style={styles.cardTitle}>Booking Details</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Property</Text>
            <Text style={styles.value} numberOfLines={1}>
              {property?.title || 'N/A'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{property?.propertyType || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{property?.city || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value} numberOfLines={2}>
              {property?.description || 'N/A'}
            </Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.amount}>
              ₹{property?.price || amount || '0'}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        <TouchableOpacity
          style={styles.paymentOption}
          activeOpacity={0.8}
          onPress={onCashPayment}>
          <View style={styles.paymentIconBox}>
            <Icon name="payments" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.paymentText}>Cash Payment</Text>
          <Icon
            name="chevron-right"
            size={24}
            color={COLORS.primary || '#007BFF'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, styles.disabledOption]}
          activeOpacity={0.9}
          onPress={onOnlinePayment}>
          <View
            style={[
              styles.paymentIconBox,
              { backgroundColor: COLORS.placeholder || '#ADB5BD' },
            ]}>
            <Icon name="credit-card" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.disabledText}>Online Payment</Text>
            <Text style={styles.maintenanceText}>Under Maintenance</Text>
          </View>
          <Icon name="lock" size={20} color={COLORS.placeholder || '#ADB5BD'} />
        </TouchableOpacity>
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
    marginLeft: 6, // centers the iOS arrow visually
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || '#111827',
  },
  headerSpacer: {
    width: 45,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Card Styles */
  card: {
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#F1F3F5',
  },
  label: {
    fontSize: 15,
    color: COLORS.subText || '#868E96',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text || '#343A40',
    flex: 2,
    textAlign: 'right',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: (COLORS.primary || '#007BFF') + '10',
    padding: 15,
    borderRadius: 14,
    marginTop: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary || '#007BFF',
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary || '#007BFF',
  },

  /* Payment Options */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text || '#212529',
    marginBottom: 15,
    marginLeft: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card || '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#007BFF',
    elevation: 2,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentIconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.primary || '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  paymentText: {
    flex: 1,
    color: COLORS.text || '#212529',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledOption: {
    borderColor: COLORS.border || '#E9ECEF',
    backgroundColor: '#F8F9FA',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: COLORS.subText || '#6C757D',
    fontSize: 16,
    fontWeight: '700',
  },
  maintenanceText: {
    fontSize: 12,
    color: COLORS.warning || '#F5A623',
    fontWeight: '600',
    marginTop: 2,
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
})
