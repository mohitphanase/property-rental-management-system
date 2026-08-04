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
  Linking,
} from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import Icon from 'react-native-vector-icons/MaterialIcons'

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
    type: 'info',
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

  const onDownloadAgreement = async () => {
    // 1. Show a loading alert
    showAlert(
      'Downloading...',
      'Please wait while we fetch your draft agreement.',
      'info'
    )

    // Replace with your actual backend PDF URL later
    const pdfUrl =
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

    // Create a local file path on the device
    const fileUri = FileSystem.documentDirectory + 'Draft_Rental_Agreement.pdf'

    try {
      // 2. Actually download the file to the phone's hidden storage
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri)

      closeAlert() // Close the "Downloading..." popup

      // 3. Open the native phone menu so the user can Save to Files or Share it
      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share your Agreement',
          UTI: 'com.adobe.pdf', // iOS specific for PDFs
        })
      } else {
        showAlert('Success', 'File downloaded successfully!', 'success')
      }
    } catch (error) {
      console.log('Download Error:', error)
      showAlert(
        'Download Failed',
        'Could not save the document. Please check your internet connection.',
        'error'
      )
    }
  }

  const onViewTerms = () => {
    showAlert(
      'Tenancy Terms',
      'Lock-in Period: 6 Months\nNotice Period: 1 Month\nMaintenance: Included in Base Rent',
      'info'
    )
  }

  const onContactOwner = () => {
    showAlert(
      'Contact Required',
      'Please contact the owner directly to finalize the lease and arrange the security deposit.',
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
      case 'warning':
        return { icon: 'warning', color: COLORS.warning }
      default:
        return { icon: 'info', color: COLORS.primary }
    }
  }

  // Calculate Mock Deposit
  const baseRent = parseInt(property?.price || amount || '0', 10)
  const securityDeposit = baseRent * 2 // Standard 2 months deposit

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
        <Text style={styles.headerTitle}>Rent & Lease Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Top Property Info Card */}
        <View style={styles.propertyHeaderCard}>
          <View style={styles.iconCircle}>
            <Icon name="home-work" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.propertyHeaderText}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {property?.title || 'Property Details'}
            </Text>
            <Text style={styles.propertySubtitle}>
              {property?.city || 'Location'} •{' '}
              {property?.propertyType || 'Type'}
            </Text>
          </View>
        </View>

        {/* Financial Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Financial Breakdown</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent</Text>
            <Text style={styles.value}>₹{baseRent}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Security Deposit</Text>
            <Text style={styles.value}>₹{securityDeposit}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Maintenance</Text>
            <Text style={[styles.value, { color: COLORS.success }]}>
              Included
            </Text>
          </View>

          {/* Dashed Divider */}
          <View style={styles.dashedDivider} />

          {/* Highlighted Total Box */}
          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalLabel}>Total Due at Move-in</Text>
              <Text style={styles.totalSubLabel}>(1st Month + Deposit)</Text>
            </View>
            <Text style={styles.amount}>₹{baseRent + securityDeposit}</Text>
          </View>
        </View>

        {/* Documents & Actions Section */}
        <Text
          style={[styles.sectionTitle, { marginLeft: 4, marginBottom: 12 }]}>
          Terms & Conditions
        </Text>

        {/* Action 1: Tenancy Terms */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={onViewTerms}>
          <View
            style={[
              styles.actionIconBox,
              { backgroundColor: COLORS.warning + '15' },
            ]}>
            <Icon name="gavel" size={24} color={COLORS.warning} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Tenancy Terms</Text>
            <Text style={styles.actionSubTitle}>Lock-in & Notice period</Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.text} />
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

    /* Property Header Card */
    propertyHeaderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    propertyHeaderText: {
      flex: 1,
    },
    propertyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 4,
    },
    propertySubtitle: {
      fontSize: 13,
      color: COLORS.subText,
      fontWeight: '500',
    },

    /* Financial Card */
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      elevation: 4,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    label: {
      fontSize: 14,
      color: COLORS.subText,
      fontWeight: '600',
    },
    value: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.text,
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginVertical: 16,
    },
    totalBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.primary + '10',
      paddingHorizontal: 16,
      paddingVertical: 18,
      borderRadius: 16,
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.primary,
      marginBottom: 2,
    },
    totalSubLabel: {
      fontSize: 11,
      color: COLORS.primary,
      fontWeight: '600',
      opacity: 0.8,
    },
    amount: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.primary,
    },

    /* Action Cards */
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    actionIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    actionTextContainer: {
      flex: 1,
    },
    actionTitle: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },
    actionSubTitle: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '500',
    },

    /* Contact Banner */
    contactBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.text, // Dark pop background
      padding: 20,
      borderRadius: 16,
      marginTop: 8,
      elevation: 5,
      shadowColor: COLORS.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    contactBannerTitle: {
      color: COLORS.background, // Reverse text color
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },
    contactBannerSub: {
      fontSize: 12,
      color: COLORS.background,
      opacity: 0.8,
      fontWeight: '500',
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
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  })
