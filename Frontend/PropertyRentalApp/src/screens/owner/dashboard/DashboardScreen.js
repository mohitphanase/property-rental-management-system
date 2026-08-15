import React, { useContext, useState, useCallback } from 'react'
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import DashboardHeader from '../../../components/owner/DashboardHeader'
import StatsCard from '../../../components/owner/StatsCard'
import SectionHeader from '../../../components/common/SectionHeader'
import QuickActionButton from '../../../components/owner/QuickActionButton'
import RecentBookingCard from '../../../components/owner/RecentBookingCard'
import PropertyCard from '../../../components/property/PropertyCard'

import dashboardData from '../../../constants/dashboardData'
import { AuthContext } from '../../../provider/AuthProvider'
import { ThemeContext } from '../../../provider/ThemeProvider'
import { getDashboardData } from '../../../services/dashboardService'
import { getMyProperties } from '../../../services/propertyService'
import { getOwnerBookings } from '../../../services/bookingService1'
import { SERVER_URL } from '../../../utils/config'

// Icon + color presets for each alert "type" so the modal actually
// reacts to alertConfig.type instead of always showing the same info icon.
const ALERT_PRESETS = {
  info: { icon: 'info', bg: '#EEF2FF', tint: '#4F5BD5' },
  success: { icon: 'check-circle', bg: '#E9FBF0', tint: '#12B76A' },
  warning: { icon: 'error-outline', bg: '#FFF7E6', tint: '#F79009' },
  error: { icon: 'highlight-off', bg: '#FEECEC', tint: '#F04438' },
}

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext)

  // Pulling dynamic COLORS from the global ThemeContext
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [latestProperties, setLatestProperties] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [dashboard, setDashboard] = useState({
    totalProperties: 0,
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
  })

  const [refreshing, setRefreshing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  // Optimized parallel data loading for fast performance
  const loadAllData = async () => {
    try {
      const [dashRes, propRes, bookRes] = await Promise.all([
        getDashboardData().catch(() => ({ data: { data: dashboard } })),
        getMyProperties().catch(() => ({ data: { data: [] } })),
        getOwnerBookings().catch(() => ({ data: { data: [] } })),
      ])

      if (dashRes?.data?.data) {
        setDashboard(dashRes.data.data)
      }
      if (propRes?.data?.data) {
        setLatestProperties(propRes.data.data)
      }
      if (bookRes?.data?.data) {
        const bookings = bookRes.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setRecentBookings(bookings.slice(0, 3))
      }
    } catch (error) {
      console.log('Dashboard Load Error:', error)
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadAllData()
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadAllData()
  }

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBadge}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
          <Text style={styles.loadingText}>Loading your dashboard…</Text>
          <Text style={styles.loadingSubText}>Just a moment</Text>
        </View>
      </SafeAreaView>
    )
  }

  const preset = ALERT_PRESETS[alertConfig.type] || ALERT_PRESETS.info

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          COLORS.background === '#FFFFFF' || COLORS.background === '#F8F9FA'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={COLORS.background}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }>
        {/* Header with working notification action */}
        <View style={styles.headerCard}>
          <DashboardHeader
            name={user?.name || user?.fullName || 'Owner'}
            onNotificationPress={() =>
              showAlert(
                'Notifications',
                'You have no new notifications at this time.',
                'info'
              )
            }
          />
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statsCardWrapper}>
              <StatsCard
                title="Properties"
                value={dashboard.totalProperties}
                icon="home"
                color={COLORS.primary}
              />
            </View>
            <View style={styles.statsCardWrapper}>
              <StatsCard
                title="Bookings"
                value={dashboard.totalBookings}
                icon="calendar"
                color={COLORS.success}
              />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsCardWrapper}>
              <StatsCard
                title="Pending"
                value={dashboard.pendingRequests}
                icon="time"
                color={COLORS.warning}
              />
            </View>
            <View style={styles.statsCardWrapper}>
              <StatsCard
                title="Earnings"
                value={`₹${dashboard.totalEarnings}`}
                icon="wallet"
                color={COLORS.error}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsContainer}>
            {dashboardData.quickActions.map((item, index) => {
              const actionColors = [
                COLORS.primary,
                COLORS.success,
                COLORS.warning,
                COLORS.text,
              ]

              return (
                <QuickActionButton
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  color={actionColors[index % actionColors.length]}
                  onPress={() => {
                    switch (item.title) {
                      case 'Add Property':
                        navigation.navigate('Properties', {
                          screen: 'AddProperty',
                        })
                        break
                      case 'Bookings':
                        navigation.navigate('Bookings')
                        break
                      case 'Payments':
                        showAlert(
                          'Coming Soon',
                          'The payments module is currently under development.',
                          'info'
                        )
                        break
                      default:
                        break
                    }
                  }}
                />
              )
            })}
          </View>
        </View>

        {/* Recent Bookings */}
        <SectionHeader
          title="Recent Bookings"
          buttonText="See All"
          onPress={() => navigation.navigate('Bookings')}
        />
        {recentBookings.length > 0 ? (
          <View style={styles.listGroup}>
            {recentBookings.map(booking => (
              <RecentBookingCard
                key={booking.bookingId}
                tenant={booking.tenantName}
                property={booking.propertyTitle}
                date={booking.startDate}
                status={booking.status}
                onPress={() => navigation.navigate('Bookings')}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View
              style={[
                styles.emptyIconBadge,
                { backgroundColor: COLORS.primary + '12' },
              ]}>
              <Icon name="event-busy" size={30} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyText}>No recent bookings</Text>
            <Text style={styles.emptySubText}>
              New bookings will show up here as they come in
            </Text>
          </View>
        )}

        {/* Latest Properties */}
        <SectionHeader
          title="Latest Properties"
          buttonText="View All"
          onPress={() =>
            navigation.navigate('Properties', { screen: 'MyProperties' })
          }
        />
        {latestProperties.length > 0 ? (
          <View style={styles.listGroup}>
            {latestProperties.slice(0, 3).map(property => (
              <PropertyCard
                key={property.propertyId}
                title={property.title}
                location={property.city}
                price={property.price}
                image={
                  property.imageUrl
                    ? `${SERVER_URL}/${property.imageUrl}`
                    : null
                }
                onPress={() =>
                  navigation.navigate('Properties', {
                    screen: 'PropertyDetails',
                    params: { propertyId: property.propertyId },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View
              style={[
                styles.emptyIconBadge,
                { backgroundColor: COLORS.warning + '15' },
              ]}>
              <Icon name="other-houses" size={30} color={COLORS.warning} />
            </View>
            <Text style={styles.emptyText}>No properties listed yet</Text>
            <Text style={styles.emptySubText}>
              Add your first property to start receiving bookings
            </Text>
            <TouchableOpacity
              style={[styles.emptyCta, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Properties', { screen: 'AddProperty' })
              }>
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyCtaText}>Add Property</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconContainer,
                { backgroundColor: preset.bg },
              ]}>
              <Icon name={preset.icon} size={40} color={preset.tint} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: preset.tint }]}
              activeOpacity={0.85}
              onPress={closeAlert}>
              <Text style={styles.alertButtonText}>Got it</Text>
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
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },

    /* Loading state */
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },
    loadingBadge: {
      width: 84,
      height: 84,
      borderRadius: 42,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.primary + '10',
      marginBottom: 18,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text,
    },
    loadingSubText: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: COLORS.subText,
    },

    /* Header */
    headerCard: {
      paddingTop: Platform.OS === 'android' ? 14 : 6,
      paddingBottom: 6,
      backgroundColor: COLORS.background,
    },

    /* Stats grid */
    statsContainer: {
      marginTop: 6,
      paddingHorizontal: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
      gap: 14,
    },
    statsCardWrapper: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      shadowColor: '#1A1A2E',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },

    /* Quick actions */
    quickActionsCard: {
      marginHorizontal: 16,
      marginBottom: 6,
      backgroundColor: COLORS.card,
      borderRadius: 22,
      paddingVertical: 14,
      paddingHorizontal: 10,
      shadowColor: '#1A1A2E',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 14,
      elevation: 2,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    /* Card groups (bookings / properties) */
    listGroup: {
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 4,
    },

    /* Empty states */
    emptyCard: {
      backgroundColor: COLORS.card,
      marginHorizontal: 16,
      borderRadius: 22,
      paddingVertical: 34,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginBottom: 18,
    },
    emptyIconBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
    },
    emptySubText: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '500',
      color: COLORS.subText,
      textAlign: 'center',
      lineHeight: 18,
    },
    emptyCta: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 22,
      borderRadius: 14,
    },
    emptyCtaText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },

    bottomSpace: {
      height: 40,
    },

    /* Custom Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,15,20,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertBox: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: COLORS.card,
      borderRadius: 30,
      padding: 26,
      alignItems: 'center',
      elevation: 12,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    alertIconContainer: {
      width: 76,
      height: 76,
      borderRadius: 38,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 14.5,
      color: COLORS.subText,
      textAlign: 'center',
      marginBottom: 26,
      lineHeight: 21,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 15,
      borderRadius: 16,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  })
