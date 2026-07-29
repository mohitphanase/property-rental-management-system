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
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import COLORS from '../../theme/colors'
import { AuthContext } from '../../provider/AuthProvider'

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext)

  // Custom Alert State for Confirmation
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
  })

  // Open the custom logout confirmation modal
  const onLogoutPress = () => {
    setAlertConfig({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to log out of your account?',
      onConfirm: logout,
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
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Profile Header (Replaced Gradient with Solid View) */}
        <View style={styles.headerBackground}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/profile.png')}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>
            {user?.fullName || user?.name || 'Tenant'}
          </Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>{user?.role || 'TENANT'}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          {/* Info Card */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Icon
                  name="email"
                  size={22}
                  color={COLORS.primary || '#007BFF'}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {user?.email || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Icon
                  name="badge"
                  size={22}
                  color={COLORS.primary || '#007BFF'}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.label}>Account Role</Text>
                <Text style={styles.value}>{user?.role || 'Tenant'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Settings</Text>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.changePasswordButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChangePassword')}>
            <Icon
              name="lock-outline"
              size={22}
              style={styles.buttonIconPrimary}
            />
            <Text style={styles.changePasswordText}>Change Password</Text>
            <Icon
              name="chevron-right"
              size={22}
              style={styles.buttonIconPrimaryRight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={onLogoutPress}>
            <Icon name="logout" size={22} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Confirmation Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              <Icon name="logout" size={38} color={COLORS.error || '#DC3545'} />
            </View>

            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

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
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  /* Header Styles */
  headerBackground: {
    width: '100%',
    backgroundColor: COLORS.primary || '#007BFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  /* Content Styles */
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text || '#212529',
    marginBottom: 15,
    marginLeft: 4,
  },

  /* Card Styles */
  card: {
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#F1F3F5',
    marginVertical: 10,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: (COLORS.primary || '#007BFF') + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: COLORS.subText || '#6C757D',
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.text || '#212529',
    fontWeight: '700',
  },

  /* Button Styles */
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#007BFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIconPrimary: {
    color: COLORS.primary || '#007BFF',
    marginRight: 12,
  },
  changePasswordText: {
    flex: 1,
    color: COLORS.primary || '#007BFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonIconPrimaryRight: {
    color: COLORS.primary || '#007BFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: (COLORS.error || '#DC3545') + '15',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  logoutIcon: {
    color: COLORS.error || '#DC3545',
    marginRight: 8,
  },
  logoutText: {
    color: COLORS.error || '#DC3545',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: (COLORS.error || '#DC3545') + '15',
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
    marginBottom: 30,
    lineHeight: 22,
  },
  alertButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  alertCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  alertCancelButtonText: {
    color: COLORS.text || '#212529',
    fontSize: 16,
    fontWeight: '700',
  },
  alertConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.error || '#DC3545',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.error || '#DC3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  alertConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
