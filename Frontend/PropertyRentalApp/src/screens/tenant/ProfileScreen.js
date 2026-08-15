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
import { ThemeContext } from '../../provider/ThemeProvider'

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext)

  // Pull the global theme state and COLORS dynamically from context
  const { isDarkMode, toggleTheme, COLORS } = useContext(ThemeContext)
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
      title: 'Sign Out',
      message: 'Are you sure you want to securely log out of your account?',
      type: 'logout',
      onConfirm: logout,
    })
  }

  // Open the Help & Support modal
  const onSupportPress = () => {
    setAlertConfig({
      visible: true,
      title: 'Help & Support',
      message:
        'Our support team is here to help you.\n\n📞 +91 98765 43210\n📧 support@rentapp.com',
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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background || '#F9FAFB'}
      />
      <View style={styles.mainContainer}>
        {/* Seamless Modern Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account and settings
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          {/* Hero Profile Avatar Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarBackdrop}>
              <View style={styles.imageRing}>
                <Image
                  source={require('../../../assets/profile.png')}
                  style={styles.profileImage}
                />
                <View style={styles.editIconBadge}>
                  <Icon name="edit" size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>
            <Text style={styles.name}>
              {user?.fullName || user?.name || 'Tenant Name'}
            </Text>
            <View style={styles.roleChip}>
              <Icon
                name="verified-user"
                size={14}
                color={COLORS.primary || '#2563EB'}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleText}>{user?.role || 'TENANT'}</Text>
            </View>
          </View>

          {/* Account Information Card */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: (COLORS.primary || '#2563EB') + '15' },
                  ]}>
                  <Icon
                    name="email"
                    size={20}
                    color={COLORS.primary || '#2563EB'}
                  />
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
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: (COLORS.primary || '#2563EB') + '15' },
                  ]}>
                  <Icon
                    name="admin-panel-settings"
                    size={20}
                    color={COLORS.primary || '#2563EB'}
                  />
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
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.card}>
              {/* App Theme Toggle */}
              <View style={styles.actionRow}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: (COLORS.text || '#111827') + '0D' },
                  ]}>
                  <Icon
                    name={isDarkMode ? 'dark-mode' : 'light-mode'}
                    size={22}
                    color={COLORS.text || '#111827'}
                  />
                </View>
                <View style={styles.actionTextGroup}>
                  <Text style={styles.actionText}>Dark Mode</Text>
                  <Text style={styles.actionSubText}>
                    {isDarkMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <Switch
                  trackColor={{
                    false: COLORS.border || '#E5E7EB',
                    true: (COLORS.primary || '#2563EB') + '80',
                  }}
                  thumbColor={
                    isDarkMode ? COLORS.primary || '#2563EB' : '#FFFFFF'
                  }
                  ios_backgroundColor={COLORS.border || '#E5E7EB'}
                  onValueChange={toggleTheme}
                  value={isDarkMode}
                />
              </View>

              <View style={styles.solidDivider} />

              {/* Change Password */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.6}
                onPress={() => navigation.navigate('ChangePassword')}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: (COLORS.text || '#111827') + '0D' },
                  ]}>
                  <Icon
                    name="lock-outline"
                    size={22}
                    color={COLORS.text || '#111827'}
                  />
                </View>
                <View style={styles.actionTextGroup}>
                  <Text style={styles.actionText}>Change Password</Text>
                  <Text style={styles.actionSubText}>
                    Update your login credentials
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={24}
                  color={COLORS.placeholder || '#9CA3AF'}
                />
              </TouchableOpacity>

              <View style={styles.solidDivider} />

              {/* Help & Support */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.6}
                onPress={onSupportPress}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: (COLORS.text || '#111827') + '0D' },
                  ]}>
                  <Icon
                    name="help-outline"
                    size={22}
                    color={COLORS.text || '#111827'}
                  />
                </View>
                <View style={styles.actionTextGroup}>
                  <Text style={styles.actionText}>Help & Support</Text>
                  <Text style={styles.actionSubText}>
                    Get in touch with our team
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={24}
                  color={COLORS.placeholder || '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modern Soft Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButtonSoft}
              activeOpacity={0.75}
              onPress={onLogoutPress}>
              <Icon
                name="logout"
                size={22}
                color={COLORS.error || '#EF4444'}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Sign Out Securely</Text>
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
                        ? (COLORS.error || '#EF4444') + '18'
                        : (COLORS.primary || '#2563EB') + '18',
                  },
                ]}>
                <Icon
                  name={
                    alertConfig.type === 'logout' ? 'logout' : 'support-agent'
                  }
                  size={34}
                  color={
                    alertConfig.type === 'logout'
                      ? COLORS.error || '#EF4444'
                      : COLORS.primary || '#2563EB'
                  }
                />
              </View>

              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>

              {alertConfig.type === 'logout' ? (
                <View style={styles.alertButtonRow}>
                  <TouchableOpacity
                    style={styles.alertCancelButton}
                    activeOpacity={0.75}
                    onPress={closeAlert}>
                    <Text style={styles.alertCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.alertConfirmButton}
                    activeOpacity={0.85}
                    onPress={handleConfirm}>
                    <Text style={styles.alertConfirmButtonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.alertSingleButton}
                  activeOpacity={0.85}
                  onPress={closeAlert}>
                  <Text style={styles.alertSingleButtonText}>Got It</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const shadow = (elevation = 3, color = '#000', opacity = 0.08) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: opacity,
  shadowRadius: elevation,
  elevation,
})

// Wrap styles in a function so it updates when COLORS changes
const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    mainContainer: {
      flex: 1,
      backgroundColor: COLORS.background || '#F9FAFB',
    },

    /* Seamless Header */
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 16,
      // Increased paddingBottom significantly from 40 to 110 to account for Tab bar
      paddingBottom: 110,
    },

    /* Modern Profile Section */
    profileSection: {
      alignItems: 'center',
      marginVertical: 24,
    },
    avatarBackdrop: {
      width: 148,
      height: 148,
      borderRadius: 74,
      backgroundColor: (COLORS.primary || '#2563EB') + '0F',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    imageRing: {
      width: 116,
      height: 116,
      borderRadius: 58,
      backgroundColor: COLORS.card || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
      ...shadow(6, '#000', 0.1),
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      position: 'relative',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 55,
      backgroundColor: COLORS.disabled || '#E5E7EB',
    },
    editIconBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: COLORS.primary || '#2563EB',
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: COLORS.card || '#FFFFFF',
    },
    name: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 8,
      textAlign: 'center',
    },
    roleChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: (COLORS.primary || '#2563EB') + '12',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    roleText: {
      fontSize: 11,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },

    /* Content Sections */
    sectionContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 14,
      marginLeft: 4,
    },

    /* Premium Cards */
    card: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 24,
      padding: 16,
      ...shadow(4, '#000', 0.04),
      borderWidth: 1,
      borderColor: COLORS.border || 'rgba(229, 231, 235, 0.8)',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 16,
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
      color: COLORS.subText || '#6B7280',
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 16,
      color: COLORS.text || '#111827',
      fontWeight: '700',
    },
    dashedDivider: {
      height: 1,
      borderWidth: 1,
      borderColor: COLORS.border || '#F3F4F6',
      borderStyle: 'dashed',
      marginVertical: 14,
    },
    solidDivider: {
      height: 1,
      backgroundColor: COLORS.border || '#F3F4F6',
      marginVertical: 4,
      marginLeft: 62,
    },

    /* Actions & Settings */
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    actionTextGroup: {
      flex: 1,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text || '#111827',
    },
    actionSubText: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.subText || '#6B7280',
      marginTop: 2,
    },

    /* Logout Button */
    logoutContainer: {
      marginTop: 8,
      marginBottom: 20,
    },
    logoutButtonSoft: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: (COLORS.error || '#EF4444') + '10',
      borderRadius: 20,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: (COLORS.error || '#EF4444') + '25',
    },
    logoutIcon: {
      marginRight: 8,
    },
    logoutText: {
      color: COLORS.error || '#EF4444',
      fontSize: 16,
      fontWeight: '800',
    },

    /* Custom Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
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
      ...shadow(20, '#000', 0.15),
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
      backgroundColor: COLORS.background || '#F9FAFB',
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      alignItems: 'center',
    },
    alertCancelButtonText: {
      color: COLORS.text || '#111827',
      fontSize: 15,
      fontWeight: '700',
    },
    alertConfirmButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.error || '#EF4444',
      alignItems: 'center',
      ...shadow(5, COLORS.error || '#EF4444', 0.3),
    },
    alertConfirmButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
  })
