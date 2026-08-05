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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    )
  }

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
        <View style={styles.headerWrapper}>
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
            <StatsCard
              title="Properties"
              value={dashboard.totalProperties}
              icon="home"
              color={COLORS.primary}
            />
            <StatsCard
              title="Bookings"
              value={dashboard.totalBookings}
              icon="calendar"
              color={COLORS.success}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="Pending"
              value={dashboard.pendingRequests}
              icon="time"
              color={COLORS.warning}
            />
            <StatsCard
              title="Earnings"
              value={`₹${dashboard.totalEarnings}`}
              icon="wallet"
              color={COLORS.error}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
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

        {/* Recent Bookings */}
        <SectionHeader
          title="Recent Bookings"
          buttonText="See All"
          onPress={() => navigation.navigate('Bookings')}
        />
        {recentBookings.length > 0 ? (
          recentBookings.map(booking => (
            <RecentBookingCard
              key={booking.bookingId}
              tenant={booking.tenantName}
              property={booking.propertyTitle}
              date={booking.startDate}
              status={booking.status}
              onPress={() => navigation.navigate('Bookings')}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Icon name="event-busy" size={32} color={COLORS.placeholder} />
            <Text style={styles.emptyText}>No recent bookings</Text>
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
          latestProperties.slice(0, 3).map(property => (
            <PropertyCard
              key={property.propertyId}
              title={property.title}
              location={property.city}
              price={property.price}
              image={
                property.imageUrl ? `${SERVER_URL}/${property.imageUrl}` : null
              }
              onPress={() =>
                navigation.navigate('Properties', {
                  screen: 'PropertyDetails',
                  params: { propertyId: property.propertyId },
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Icon name="other-houses" size={32} color={COLORS.placeholder} />
            <Text style={styles.emptyText}>No properties listed yet</Text>
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
                { backgroundColor: COLORS.primary + '15' },
              ]}>
              <Icon name="info" size={38} color={COLORS.primary} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: COLORS.primary }]}
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
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.subText,
    },
    headerWrapper: {
      paddingTop: Platform.OS === 'android' ? 10 : 0,
      backgroundColor: COLORS.background,
    },
    statsContainer: {
      marginTop: 10,
      paddingHorizontal: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 12,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    emptyCard: {
      backgroundColor: COLORS.card,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginBottom: 16,
    },
    emptyText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.subText,
    },
    bottomSpace: {
      height: 40,
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
  })
