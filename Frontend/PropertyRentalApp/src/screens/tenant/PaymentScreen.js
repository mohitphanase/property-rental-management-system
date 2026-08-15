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
    showAlert(
      'Downloading...',
      'Please wait while we fetch your draft agreement.',
      'info'
    )

    const pdfUrl =
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    const fileUri = FileSystem.documentDirectory + 'Draft_Rental_Agreement.pdf'

    try {
      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri)
      closeAlert()

      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share your Agreement',
          UTI: 'com.adobe.pdf',
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
    if (!property?.ownerPhone) {
      showAlert(
        'Contact Unavailable',
        'The owner has not provided a direct contact number yet.',
        'warning'
      )
      return
    }
    Linking.openURL(`tel:${property.ownerPhone}`)
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success || '#10B981' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#EF4444' }
      case 'warning':
        return { icon: 'warning', color: COLORS.warning || '#F59E0B' }
      default:
        return { icon: 'info', color: COLORS.primary || '#2563EB' }
    }
  }

  // Calculate Mock Deposit & Formatting
  const baseRent = parseInt(property?.price || amount || '0', 10)
  const securityDeposit = baseRent * 2
  const totalDue = baseRent + securityDeposit

  const formatCurrency = num => `₹${Number(num).toLocaleString('en-IN')}`

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background || '#F9FAFB'}
      />

      {/* Seamless Top Bar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={COLORS.text || '#111827'} />
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
            <Icon name="domain" size={24} color={COLORS.primary || '#2563EB'} />
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

        {/* Financial Breakdown Card (Receipt Style) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Financial Breakdown</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent</Text>
            <Text style={styles.value}>{formatCurrency(baseRent)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Security Deposit (2 Months)</Text>
            <Text style={styles.value}>{formatCurrency(securityDeposit)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Maintenance</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>Included</Text>
            </View>
          </View>

          {/* Dashed Divider */}
          <View style={styles.dashedDivider} />

          {/* Highlighted Total Box */}
          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalLabel}>Total Due at Move-in</Text>
              <Text style={styles.totalSubLabel}>1st Month + Deposit</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(totalDue)}</Text>
          </View>
        </View>

        {/* Documents & Actions Section */}
        <Text style={styles.sectionTitleOutside}>Documents & Terms</Text>

        {/* Action 1: Tenancy Terms */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={onViewTerms}>
          <View
            style={[
              styles.actionIconBox,
              { backgroundColor: (COLORS.warning || '#F59E0B') + '15' },
            ]}>
            <Icon name="gavel" size={22} color={COLORS.warning || '#F59E0B'} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Tenancy Terms</Text>
            <Text style={styles.actionSubTitle}>Lock-in & Notice period</Text>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            color={COLORS.placeholder || '#9CA3AF'}
          />
        </TouchableOpacity>

        {/* Action 2: Download Agreement */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={onDownloadAgreement}>
          <View
            style={[
              styles.actionIconBox,
              { backgroundColor: (COLORS.primary || '#2563EB') + '15' },
            ]}>
            <Icon
              name="description"
              size={22}
              color={COLORS.primary || '#2563EB'}
            />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Draft Agreement</Text>
            <Text style={styles.actionSubTitle}>Download PDF copy</Text>
          </View>
          <Icon
            name="file-download"
            size={24}
            color={COLORS.placeholder || '#9CA3AF'}
          />
        </TouchableOpacity>

        {/* Contact Owner Banner */}
        <TouchableOpacity
          style={styles.contactBanner}
          activeOpacity={0.9}
          onPress={onContactOwner}>
          <View style={styles.contactBannerContent}>
            <Text style={styles.contactBannerTitle}>Ready to move in?</Text>
            <Text style={styles.contactBannerSub}>
              Contact the owner directly to finalize your lease and arrange the
              deposit.
            </Text>
          </View>
          <View style={styles.contactIconCircle}>
            <Icon
              name="phone-in-talk"
              size={24}
              color={COLORS.text || '#111827'}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Premium Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor: getAlertStyle(alertConfig.type).color + '1A',
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
    </SafeAreaView>
  )
}

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background || '#F9FAFB',
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
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.card || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
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
      backgroundColor: COLORS.card || '#FFFFFF',
      padding: 16,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: (COLORS.primary || '#2563EB') + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    propertyHeaderText: {
      flex: 1,
    },
    propertyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 4,
    },
    propertySubtitle: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Financial Card (Receipt Style) */
    card: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      marginBottom: 28,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 16,
    },
    sectionTitleOutside: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginLeft: 4,
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    label: {
      fontSize: 14,
      color: COLORS.subText || '#4B5563',
      fontWeight: '500',
    },
    value: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text || '#111827',
    },
    badgeSuccess: {
      backgroundColor: (COLORS.success || '#10B981') + '15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeSuccessText: {
      color: COLORS.success || '#10B981',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      borderStyle: 'dashed',
      marginVertical: 20,
    },
    totalBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      paddingHorizontal: 16,
      paddingVertical: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: (COLORS.primary || '#2563EB') + '20',
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
      marginBottom: 4,
    },
    totalSubLabel: {
      fontSize: 12,
      color: COLORS.primary || '#2563EB',
      fontWeight: '600',
      opacity: 0.8,
    },
    amount: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
    },

    /* Action Cards */
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card || '#FFFFFF',
      padding: 16,
      borderRadius: 20,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    actionIconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    actionTextContainer: {
      flex: 1,
    },
    actionTitle: {
      color: COLORS.text || '#111827',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    actionSubTitle: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Sleek Contact Banner */
    contactBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.text || '#111827',
      padding: 20,
      borderRadius: 24,
      marginTop: 14,
      elevation: 6,
      shadowColor: COLORS.text || '#111827',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
    contactBannerContent: {
      flex: 1,
      paddingRight: 16,
    },
    contactBannerTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
    contactBannerSub: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
      lineHeight: 18,
    },
    contactIconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* Premium Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 28,
      padding: 24,
      alignItems: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
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
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  })
