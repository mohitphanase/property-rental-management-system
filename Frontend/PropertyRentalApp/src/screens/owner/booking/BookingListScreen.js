import React, { useCallback, useState, useContext } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import {
  updateBookingStatus,
  getOwnerBookings,
  // deleteBooking // <-- Import your delete API here when ready
} from '../../../services/bookingService1'
import { ThemeContext } from '../../../provider/ThemeProvider'

export default function BookingListScreen() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dynamic Theme Integration
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'confirm'
    onConfirm: null,
  })

  const showAlert = (title, message, type, onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  const loadBookings = async () => {
    try {
      const response = await getOwnerBookings()
      setBookings(response.data?.data || [])
    } catch (error) {
      console.log('Error loading bookings:', error.response?.data || error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadBookings()
  }

  useFocusEffect(
    useCallback(() => {
      loadBookings()
    }, [])
  )

  const handleStatusChangeRequest = (bookingId, status) => {
    const actionText = status === 'APPROVED' ? 'accept' : 'reject'
    showAlert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this booking request?`,
      'confirm',
      () => executeStatusChange(bookingId, status)
    )
  }

  const executeStatusChange = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status)
      closeAlert()

      setTimeout(() => {
        showAlert(
          'Success',
          `Booking ${status.toLowerCase()} successfully.`,
          'success'
        )
        loadBookings()
      }, 500)
    } catch (error) {
      closeAlert()
      setTimeout(() => {
        showAlert(
          'Error',
          error.response?.data?.message || 'Failed to update booking status.',
          'error'
        )
      }, 500)
    }
  }

  // NEW: Handler for Rejected Bookings (e.g., Delete action)
  const handleDeleteRequest = bookingId => {
    showAlert(
      'Delete Booking',
      'Are you sure you want to remove this rejected booking from your list?',
      'confirm',
      () => executeDelete(bookingId)
    )
  }

  const executeDelete = async bookingId => {
    try {
      // TODO: Replace with your actual delete API call
      // await deleteBooking(bookingId)

      closeAlert()
      setTimeout(() => {
        showAlert(
          'Deleted',
          'The rejected booking was removed successfully.',
          'success'
        )
        loadBookings() // Refresh the list
      }, 500)
    } catch (error) {
      closeAlert()
      setTimeout(() => {
        showAlert('Error', 'Failed to delete the booking.', 'error')
      }, 500)
    }
  }

  // Helpers
  const getInitials = name => {
    if (!name) return 'TN'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const getStatusBadgeStyle = status => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return { bg: COLORS.success + '15', text: COLORS.success }
      case 'REJECTED':
        return { bg: COLORS.error + '15', text: COLORS.error }
      case 'CANCELLED':
        return { bg: COLORS.placeholder + '20', text: COLORS.subText }
      default:
        return { bg: COLORS.warning + '15', text: COLORS.warning }
    }
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      case 'confirm':
        return { icon: 'help-outline', color: COLORS.primary }
      default:
        return { icon: 'info', color: COLORS.warning }
    }
  }

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length

  const renderItem = ({ item }) => {
    const badgeStyle = getStatusBadgeStyle(item.status)
    const initials = getInitials(item.tenantName)

    return (
      <View style={styles.card}>
        {/* Card Header: Avatar + Info + Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.tenantInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.tenantTextContainer}>
              <Text style={styles.tenantName} numberOfLines={1}>
                {item.tenantName || 'Tenant'}
              </Text>
              <Text style={styles.bookingIdText}>ID: #{item.bookingId}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
              {item.status || 'PENDING'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Dates Info */}
        <View style={styles.datesContainer}>
          <View style={styles.dateBox}>
            <Icon
              name="login"
              size={16}
              color={COLORS.subText}
              style={styles.dateIcon}
            />
            <View>
              <Text style={styles.dateLabel}>CHECK IN</Text>
              <Text style={styles.dateValue}>{item.startDate || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.dateSeparator} />

          <View style={styles.dateBox}>
            <Icon
              name="logout"
              size={16}
              color={COLORS.subText}
              style={styles.dateIcon}
            />
            <View>
              <Text style={styles.dateLabel}>CHECK OUT</Text>
              <Text style={styles.dateValue}>{item.endDate || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Actions for Pending Bookings */}
        {item.status === 'PENDING' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() =>
                handleStatusChangeRequest(item.bookingId, 'REJECTED')
              }
              activeOpacity={0.7}>
              <Icon name="close" size={18} color={COLORS.error} />
              <Text style={styles.rejectButtonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() =>
                handleStatusChangeRequest(item.bookingId, 'APPROVED')
              }
              activeOpacity={0.8}>
              <Icon name="check" size={18} color={COLORS.white} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* NEW: Action Button for REJECTED Bookings */}
        {item.status === 'REJECTED' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRequest(item.bookingId)}
              activeOpacity={0.7}>
              <Icon name="delete-outline" size={18} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Delete Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Summary */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Booking Requests</Text>
            <Text style={styles.headerSubtitle}>
              Manage tenant booking requests
            </Text>
          </View>
          {pendingCount > 0 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{pendingCount} Pending</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={item => item.bookingId.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon
                    name="assignment"
                    size={32}
                    color={COLORS.placeholder}
                  />
                </View>
                <Text style={styles.emptyTitle}>No Bookings Found</Text>
                <Text style={styles.emptySubtitle}>
                  You don't have any booking requests at the moment.
                </Text>
              </View>
            }
          />
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

              {alertConfig.type === 'confirm' ? (
                <View style={styles.alertButtonRow}>
                  <TouchableOpacity
                    style={styles.alertCancelBtn}
                    activeOpacity={0.7}
                    onPress={closeAlert}>
                    <Text style={styles.alertCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.alertConfirmBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeAlert()
                      if (alertConfig.onConfirm) alertConfig.onConfirm()
                    }}>
                    <Text style={styles.alertConfirmBtnText}>Yes, Proceed</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.alertButton,
                    { backgroundColor: getAlertStyle(alertConfig.type).color },
                  ]}
                  activeOpacity={0.8}
                  onPress={closeAlert}>
                  <Text style={styles.alertButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* Header */
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 20,
      paddingBottom: 20,
      backgroundColor: COLORS.background,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.subText,
      marginTop: 4,
    },
    counterBadge: {
      backgroundColor: COLORS.warning + '15',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    counterText: {
      color: COLORS.warning,
      fontSize: 13,
      fontWeight: '700',
    },

    /* List */
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },

    /* Card Styles */
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 3,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tenantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: COLORS.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '800',
    },
    tenantTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    tenantName: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 2,
    },
    bookingIdText: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: COLORS.border,
      marginVertical: 16,
    },

    /* Dates Container */
    datesContainer: {
      flexDirection: 'row',
      backgroundColor: COLORS.background,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    dateBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateIcon: {
      marginRight: 10,
    },
    dateLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.subText,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
    },
    dateSeparator: {
      width: 1,
      height: 30,
      backgroundColor: COLORS.border,
      marginHorizontal: 12,
    },

    /* Action Buttons */
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 12,
    },
    acceptButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: COLORS.success,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: COLORS.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      gap: 6,
    },
    acceptButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },
    rejectButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: COLORS.background,
      borderWidth: 1.5,
      borderColor: COLORS.error + '50',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    rejectButtonText: {
      color: COLORS.error,
      fontWeight: '800',
      fontSize: 15,
    },

    /* NEW: Delete Button Styles */
    deleteButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: COLORS.error + '10', // Light red background
      borderWidth: 1.5,
      borderColor: COLORS.error + '40',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    deleteButtonText: {
      color: COLORS.error,
      fontWeight: '800',
      fontSize: 15,
    },

    /* Empty State */
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 20,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: 'center',
      lineHeight: 20,
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
    },
    alertButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    alertCancelBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
    },
    alertCancelBtnText: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: '700',
    },
    alertConfirmBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      elevation: 3,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    alertConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
  })
