import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { ThemeContext } from '../../provider/ThemeProvider'
import { changePassword } from '../../services/profileService'

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Pulling dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

  const onUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Validation Error', 'Please fill all fields.', 'warning')
      return
    }

    if (newPassword.length < 6) {
      showAlert(
        'Weak Password',
        'Password must contain at least 6 characters.',
        'warning'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      showAlert(
        'Mismatch',
        'New Password and Confirm Password do not match.',
        'error'
      )
      return
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      })

      showAlert(
        'Success',
        'Your password has been changed successfully.',
        'success',
        () => navigation.goBack()
      )
    } catch (error) {
      console.log(error.response?.data)
      showAlert(
        'Update Failed',
        error.response?.data?.message || 'Failed to change password.',
        'error'
      )
    }
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.iconWrapper}>
              <Icon name="lock-outline" size={42} color={COLORS.primary} />
            </View>
            <Text style={styles.subHeading}>
              Your new password must be different from previously used
              passwords.
            </Text>
          </View>

          {/* Current Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="vpn-key"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showCurrent ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={COLORS.subText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter new password (min. 6 chars)"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showNew ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={COLORS.subText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock-clock"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showConfirm ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={COLORS.subText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onUpdatePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
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
      </KeyboardAvoidingView>
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

    mainContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 40,
    },

    /* Form Header Styles */
    headerContainer: {
      alignItems: 'center',
      marginBottom: 35,
      marginTop: 10,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    subHeading: {
      fontSize: 15,
      color: COLORS.subText,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 15,
      fontWeight: '500',
    },

    /* Input Styles */
    inputSection: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 8,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 16,
      paddingHorizontal: 15,
      height: 56,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: '100%',
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '500',
    },

    /* Button Styles */
    button: {
      marginTop: 20,
      backgroundColor: COLORS.primary,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: 0.5,
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
