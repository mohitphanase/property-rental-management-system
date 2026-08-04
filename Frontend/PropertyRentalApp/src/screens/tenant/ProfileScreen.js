import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { AuthContext } from '../../provider/AuthProvider'
// IMPORT your new ThemeContext here!
import { ThemeContext } from '../../provider/ThemeProvider'

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext)

  // Pull the global theme state and COLORS dynamically from context
  const { isDarkMode, toggleTheme, COLORS } = useContext(ThemeContext)

  // Generate dynamic styles based on the current theme colors
  const styles = getStyles(COLORS)

  // Dynamic Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'logout', // 'logout' or 'info'
    onConfirm: null,
  })

  // Open the custom logout confirmation modal
  const onLogoutPress = () => {
    setAlertConfig({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to log out of your account?',
      type: 'logout',
      onConfirm: logout,
    })
  }

  // Open the Help & Support modal
  const onSupportPress = () => {
    setAlertConfig({
      visible: true,
      title: 'Help & Support',
      message: 'For assistance, please contact us at:\n\n📞 +91 98765 43210',
      type: 'info',
      onConfirm: null,
    })
  }

  // Close modal
  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  // Handle confirmation action
  const handleConfirm = () => {
    if (alertConfig.onConfirm) {
      alertConfig.onConfirm()
    }
    closeAlert()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Seamless Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          {/* Modern Profile Avatar Section */}
          <View style={styles.profileSection}>
            <View style={styles.imageRing}>
              <Image
                source={require('../../../assets/profile.png')}
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.name}>
              {user?.fullName || user?.name || 'Tenant Name'}
            </Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleText}>{user?.role || 'TENANT'}</Text>
            </View>
          </View>

          {/* Account Information Card */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Icon name="email" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {user?.email || 'Not Available'}
                  </Text>
                </View>
              </View>

              <View style={styles.dashedDivider} />

              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Icon name="verified-user" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.label}>Account Role</Text>
                  <Text style={styles.value}>{user?.role || 'Tenant'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings & Actions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.card}>
              {/* App Theme Toggle */}
              <View style={styles.actionRow}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: COLORS.text + '10' },
                  ]}>
                  <Icon
                    name={isDarkMode ? 'dark-mode' : 'light-mode'}
                    size={20}
                    color={COLORS.text}
                  />
                </View>
                <Text style={styles.actionText}>Dark Mode</Text>
                <Switch
                  trackColor={{
                    false: COLORS.border,
                    true: COLORS.primary + '80',
                  }}
                  thumbColor={isDarkMode ? COLORS.primary : '#f4f3f4'}
                  ios_backgroundColor={COLORS.border}
                  onValueChange={toggleTheme}
                  value={isDarkMode}
                />
              </View>

              <View style={styles.solidDivider} />

              {/* Change Password */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ChangePassword')}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: COLORS.text + '10' },
                  ]}>
                  <Icon name="lock-outline" size={20} color={COLORS.text} />
                </View>
                <Text style={styles.actionText}>Change Password</Text>
                <Icon
                  name="chevron-right"
                  size={22}
                  color={COLORS.placeholder}
                />
              </TouchableOpacity>

              <View style={styles.solidDivider} />

              {/* Help & Support */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={onSupportPress}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: COLORS.text + '10' },
                  ]}>
                  <Icon name="help-outline" size={20} color={COLORS.text} />
                </View>
                <Text style={styles.actionText}>Help & Support</Text>
                <Icon
                  name="chevron-right"
                  size={22}
                  color={COLORS.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modern Soft Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButtonSoft}
              activeOpacity={0.8}
              onPress={onLogoutPress}>
              <Icon
                name="logout"
                size={22}
                color={COLORS.error}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Logout Securely</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Dynamic Custom Modal */}
        <Modal transparent visible={alertConfig.visible} animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <View
                style={[
                  styles.alertIconContainer,
                  {
                    backgroundColor:
                      alertConfig.type === 'logout'
                        ? COLORS.error + '15'
                        : COLORS.primary + '15',
                  },
                ]}>
                <Icon
                  name={
                    alertConfig.type === 'logout' ? 'logout' : 'support-agent'
                  }
                  size={38}
                  color={
                    alertConfig.type === 'logout'
                      ? COLORS.error
                      : COLORS.primary
                  }
                />
              </View>

              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>

              {alertConfig.type === 'logout' ? (
                <View style={styles.alertButtonRow}>
                  <TouchableOpacity
                    style={styles.alertCancelButton}
                    activeOpacity={0.7}
                    onPress={closeAlert}>
                    <Text style={styles.alertCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.alertConfirmButton}
                    activeOpacity={0.7}
                    onPress={handleConfirm}>
                    <Text style={styles.alertConfirmButtonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.alertSingleButton}
                  activeOpacity={0.8}
                  onPress={closeAlert}>
                  <Text style={styles.alertSingleButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

// Wrap styles in a function so it updates when COLORS changes
const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    /* Seamless Header */
    header: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingBottom: 15,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 15 : 15,
      backgroundColor: COLORS.background,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text,
      letterSpacing: 0.3,
    },

    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 40,
    },

    /* Modern Profile Section */
    profileSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    imageRing: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
      marginBottom: 16,
      elevation: 6,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 55,
      backgroundColor: COLORS.disabled || '#E9ECEF',
    },
    name: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
    },
    roleChip: {
      backgroundColor: COLORS.primary + '15',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 12,
    },
    roleText: {
      fontSize: 12,
      fontWeight: '800',
      color: COLORS.primary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },

    /* Content Sections */
    sectionContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 12,
      marginLeft: 4,
    },

    /* Premium Cards */
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 16,
      elevation: 3,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    infoTextContainer: {
      flex: 1,
      justifyContent: 'center',
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
      color: COLORS.text,
      fontWeight: '700',
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginVertical: 14,
    },
    solidDivider: {
      height: 1,
      backgroundColor: COLORS.border,
      marginVertical: 4,
      marginLeft: 60,
    },

    /* Actions & Settings */
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    actionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
    },

    /* Logout Button */
    logoutContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    logoutButtonSoft: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.error + '10', // Tinted background
      borderRadius: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: COLORS.error + '20',
    },
    logoutIcon: {
      marginRight: 8,
    },
    logoutText: {
      color: COLORS.error,
      fontSize: 16,
      fontWeight: '800',
    },

    /* Custom Modal Styling */
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
      shadowColor: '#000',
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
    alertButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    alertCancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
    },
    alertCancelButtonText: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: '700',
    },
    alertConfirmButton: {
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
    alertConfirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    alertSingleButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    alertSingleButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  })
