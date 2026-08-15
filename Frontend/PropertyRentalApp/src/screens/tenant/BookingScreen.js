import React, { useEffect, useState, useCallback, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native'

import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { getBookings } from '../../services/bookingService'
import { getPropertyById } from '../../services/propertyServicet'
import { SERVER_URL } from '../../utils/config'
import { ThemeContext } from '../../provider/ThemeProvider'

export default function BookingScreen() {
  const navigation = useNavigation()

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('ALL')
  const [propertyImages, setPropertyImages] = useState({})

  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  useFocusEffect(
    useCallback(() => {
      loadBookings()
    }, [])
  )

  useEffect(() => {
    filterBookings(selectedTab)
  }, [bookings, selectedTab])

  const loadBookings = async () => {
    try {
      const response = await getBookings()
      const bookingList = response.data.data

      const updatedBookings = await Promise.all(
        bookingList.map(async booking => {
          try {
            const propertyResponse = await getPropertyById(booking.propertyId)
            return {
              ...booking,
              ...propertyResponse.data.data,
            }
          } catch (e) {
            return booking
          }
        })
      )

      const sortedBookings = updatedBookings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )

      setBookings(sortedBookings)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadBookings()
  }

  const filterBookings = status => {
    if (status === 'ALL') {
      setFilteredBookings(bookings)
      return
    }
    const data = bookings.filter(item => item.status === status)
    setFilteredBookings(data)
  }

  const getStatusConfig = status => {
    switch (status) {
      case 'APPROVED':
        return {
          style: { backgroundColor: COLORS.success || '#10B981' },
          soft: (COLORS.success || '#10B981') + '15',
          icon: 'check-circle',
          text: 'Approved',
        }
      case 'PENDING':
        return {
          style: { backgroundColor: COLORS.warning || '#F59E0B' },
          soft: (COLORS.warning || '#F59E0B') + '15',
          icon: 'schedule',
          text: 'Pending',
        }
      case 'REJECTED':
        return {
          style: { backgroundColor: COLORS.error || '#EF4444' },
          soft: (COLORS.error || '#EF4444') + '15',
          icon: 'cancel',
          text: 'Rejected',
        }
      case 'CANCELLED':
        return {
          style: { backgroundColor: COLORS.cancelled || '#6B7280' },
          soft: (COLORS.cancelled || '#6B7280') + '15',
          icon: 'block',
          text: 'Cancelled',
        }
      default:
        return {
          style: { backgroundColor: COLORS.placeholder || '#9CA3AF' },
          soft: (COLORS.placeholder || '#9CA3AF') + '15',
          icon: 'info',
          text: status,
        }
    }
  }

  const TAB_META = {
    ALL: { icon: 'apps' },
    PENDING: { icon: 'schedule' },
    APPROVED: { icon: 'check-circle' },
    REJECTED: { icon: 'cancel' },
    CANCELLED: { icon: 'block' },
  }

  const renderBooking = ({ item }) => {
    const statusConfig = getStatusConfig(item.status)
    const imageUrl = propertyImages[item.propertyId]
      ? `${SERVER_URL}${propertyImages[item.propertyId]}`
      : item?.images?.[0]?.imageUrl
        ? `${SERVER_URL}/${item.images[0].imageUrl}`
        : null

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.95}
        onPress={() =>
          navigation.navigate('BookingDetails', { booking: item })
        }>
        {/* Status accent stripe */}
        <View style={[styles.cardAccentStripe, statusConfig.style]} />

        {/* Image Section */}
        <View style={styles.imageWrapper}>
          <Image
            source={
              imageUrl
                ? { uri: imageUrl }
                : require('../../../assets/property_placeholder.png')
            }
            style={styles.propertyImage}
            resizeMode="cover"
          />
          <View style={[styles.statusBadge, statusConfig.style]}>
            <Icon
              name={statusConfig.icon}
              size={12}
              color="#FFFFFF"
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <View>
            <View style={styles.cardHeaderRow}>
              <View style={styles.bookingIdPill}>
                <Icon
                  name="confirmation-number"
                  size={11}
                  color={COLORS.primary || '#2563EB'}
                />
                <Text style={styles.bookingId}>#{item.bookingId}</Text>
              </View>
              <Text style={styles.dateAppliedText}>
                {item.createdAt?.split(' ')[0] || item.createdAt}
              </Text>
            </View>

            <Text style={styles.propertyName} numberOfLines={1}>
              {item.propertyName || item.title || 'Unknown Property'}
            </Text>

            <View style={styles.infoRow}>
              <Icon
                name="location-on"
                size={14}
                color={COLORS.subText || '#6B7280'}
              />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.location || item.city || 'Location unavailable'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon
                name="date-range"
                size={14}
                color={COLORS.subText || '#6B7280'}
              />
              <Text style={styles.infoText}>
                {item.startDate}{' '}
                <Text style={{ color: COLORS.placeholder || '#9CA3AF' }}>
                  to
                </Text>{' '}
                {item.endDate}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>
              ₹{Number(item.price ?? item.rent ?? 0).toLocaleString('en-IN')}
              <Text style={styles.priceSubText}>/mo</Text>
            </Text>
            <View style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Details</Text>
              <Icon
                name="chevron-right"
                size={16}
                color={COLORS.primary || '#2563EB'}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.loader}>
          <View style={styles.loaderRing}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary || '#2563EB'}
            />
          </View>
          <Text style={styles.loadingText}>Fetching your bookings...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.card || '#FFFFFF'}
      />
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>My Bookings</Text>
          <Text style={styles.screenSubtitle}>
            Manage and track your stay requests
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}>
            {TABS.map(tab => {
              const isActive = selectedTab === tab
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setSelectedTab(tab)}>
                  <Icon
                    name={TAB_META[tab]?.icon || 'label'}
                    size={14}
                    color={isActive ? '#FFFFFF' : COLORS.subText || '#4B5563'}
                    style={styles.tabIcon}
                  />
                  <Text
                    style={[styles.tabText, isActive && styles.activeTabText]}>
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Bookings List */}
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.bookingId.toString()}
          renderItem={renderBooking}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary || '#2563EB']}
              tintColor={COLORS.primary || '#2563EB'}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Icon
                  name="event-busy"
                  size={48}
                  color={COLORS.primary || '#2563EB'}
                />
              </View>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptyText}>
                You don't have any bookings matching this status right now.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Home')}>
                <Text style={styles.exploreButtonText}>Explore Properties</Text>
                <Icon name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.card || '#FFFFFF',
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background || '#F5F6FA',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#F5F6FA',
    },
    loaderRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    loadingText: {
      marginTop: 14,
      fontSize: 15,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Header */
    header: {
      paddingHorizontal: 20,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
      paddingBottom: 16,
      backgroundColor: COLORS.card || '#FFFFFF',
    },
    screenTitle: {
      fontSize: 27,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    screenSubtitle: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Tabs Styling */
    tabWrapper: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#F3F4F6',
      paddingBottom: 14,
    },
    tabContainer: {
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      height: 40,
      marginRight: 10,
      borderRadius: 22,
      backgroundColor: COLORS.background || '#F5F6FA',
    },
    tabIcon: {
      marginRight: 6,
    },
    activeTab: {
      backgroundColor: COLORS.primary || '#2563EB',
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
      elevation: 4,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.subText || '#4B5563',
    },
    activeTabText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },

    /* List & Card Styling */
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 40,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 24,
      padding: 14,
      marginBottom: 18,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
      overflow: 'hidden',
    },
    cardAccentStripe: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 5,
    },
    imageWrapper: {
      position: 'relative',
      marginRight: 14,
      marginLeft: 6,
    },
    propertyImage: {
      width: 108,
      height: 132,
      borderRadius: 16,
      backgroundColor: '#E5E7EB',
    },
    statusBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    statusIcon: {
      marginRight: 4,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    /* Card Content */
    cardContent: {
      flex: 1,
      justifyContent: 'space-between',
      paddingRight: 4,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    bookingIdPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: (COLORS.primary || '#2563EB') + '12',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    bookingId: {
      fontSize: 11,
      color: COLORS.primary || '#2563EB',
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    dateAppliedText: {
      fontSize: 11,
      color: COLORS.subText || '#6B7280',
      fontWeight: '600',
    },
    propertyName: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 6,
      lineHeight: 22,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    infoText: {
      fontSize: 13,
      color: COLORS.subText || '#4B5563',
      marginLeft: 6,
      flex: 1,
      fontWeight: '500',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 10,
    },
    priceText: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    priceSubText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.subText || '#6B7280',
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
    },
    detailsButtonText: {
      color: COLORS.primary || '#2563EB',
      fontSize: 13,
      fontWeight: '700',
      marginRight: 2,
    },

    /* Empty State */
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 24,
    },
    emptyIconBox: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 22,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    exploreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: COLORS.primary || '#2563EB',
      paddingHorizontal: 28,
      paddingVertical: 15,
      borderRadius: 26,
      elevation: 5,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    exploreButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },
  })
