import React, { useState, useContext } from 'react'
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
import { ThemeContext } from '../../provider/ThemeProvider'

export default function PaymentScreen({ route, navigation }) {
  const { booking, property, amount } = route.params

  // Pulling dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

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
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      default:
        return { icon: 'warning', color: COLORS.warning }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Invoice-Style Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Icon name="receipt-long" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Payment Summary</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Property</Text>
            <Text style={styles.value} numberOfLines={1}>
              {property?.title || 'N/A'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{property?.propertyType || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{property?.city || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value} numberOfLines={2}>
              {property?.description || 'N/A'}
            </Text>
          </View>

          {/* Dashed Divider */}
          <View style={styles.dashedDivider} />

          {/* Highlighted Total Box */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.amount}>
              ₹{property?.price || amount || '0'}
            </Text>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
        </View>

        {/* Active Cash Payment Option */}
        <TouchableOpacity
          style={styles.paymentOptionActive}
          activeOpacity={0.8}
          onPress={onCashPayment}>
          <View style={styles.paymentIconBoxActive}>
            <Icon name="payments" size={24} color={COLORS.white} />
          </View>
          <View style={styles.paymentTextContainer}>
            <Text style={styles.paymentTextActive}>Cash Payment</Text>
            <Text style={styles.paymentSubText}>Pay directly to owner</Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Disabled Online Payment Option */}
        <TouchableOpacity
          style={styles.paymentOptionDisabled}
          activeOpacity={0.9}
          onPress={onOnlinePayment}>
          <View style={styles.paymentIconBoxDisabled}>
            <Icon name="credit-card" size={22} color={COLORS.white} />
          </View>
          <View style={styles.paymentTextContainer}>
            <Text style={styles.disabledText}>Online Payment</Text>
            <Text style={styles.maintenanceText}>
              Currently under maintenance
            </Text>
          </View>
          <Icon name="lock-outline" size={20} color={COLORS.placeholder} />
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

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
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
      backgroundColor: COLORS.background,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
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
      width: 44,
    },

    scrollContainer: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 40,
    },

    /* Invoice-Style Card */
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 30,
      elevation: 4,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginLeft: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    label: {
      fontSize: 14,
      color: COLORS.subText,
      fontWeight: '600',
      flex: 1,
    },
    value: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
      flex: 2,
      textAlign: 'right',
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginVertical: 15,
    },
    totalBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.primary + '10',
      paddingHorizontal: 16,
      paddingVertical: 18,
      borderRadius: 16,
      marginTop: 5,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.primary,
    },
    amount: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.primary,
    },

    /* Payment Methods Section */
    sectionHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
    },

    /* Active Payment Option */
    paymentOptionActive: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
    },
    paymentIconBoxActive: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    paymentTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    paymentTextActive: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 2,
    },
    paymentSubText: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '500',
    },

    /* Disabled Payment Option */
    paymentOptionDisabled: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background, // Fixed Hardcode!
      padding: 16,
      borderRadius: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    paymentIconBoxDisabled: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: COLORS.placeholder,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    disabledText: {
      color: COLORS.placeholder,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 2,
    },
    maintenanceText: {
      fontSize: 12,
      color: COLORS.warning,
      fontWeight: '600',
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
      letterSpacing: 0.5,
    },
  })
