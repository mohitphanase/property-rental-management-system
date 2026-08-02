import React, { useEffect, useState, useCallback } from 'react'
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
import COLORS from '../../theme/colors'

export default function BookingScreen() {
  const navigation = useNavigation()

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('ALL')
  const [propertyImages, setPropertyImages] = useState({})

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
          style: { backgroundColor: COLORS.success },
          icon: 'check-circle',
          text: 'Approved',
        }
      case 'PENDING':
        return {
          style: { backgroundColor: COLORS.warning },
          icon: 'hourglass-empty',
          text: 'Pending',
        }
      case 'REJECTED':
        return {
          style: { backgroundColor: COLORS.error },
          icon: 'cancel',
          text: 'Rejected',
        }
      case 'CANCELLED':
        return {
          style: { backgroundColor: COLORS.cancelled },
          icon: 'block',
          text: 'Cancelled',
        }
      default:
        return {
          style: { backgroundColor: COLORS.placeholder },
          icon: 'info',
          text: status,
        }
    }
  }

  const renderBooking = ({ item }) => {
    const statusConfig = getStatusConfig(item.status)
    // Fallback if propertyImages state is used, else try to get from merged property data
    const imageUrl = propertyImages[item.propertyId]
      ? `${SERVER_URL}${propertyImages[item.propertyId]}`
      : item?.images?.[0]?.imageUrl
        ? `${SERVER_URL}/${item.images[0].imageUrl}`
        : null

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('BookingDetails', { booking: item })
        }>
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
              color={COLORS.white}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <View>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.bookingId}>Booking #{item.bookingId}</Text>
              <Text style={styles.dateAppliedText}>
                {item.createdAt?.split(' ')[0] || item.createdAt}
              </Text>
            </View>

            <Text style={styles.propertyName} numberOfLines={1}>
              {item.propertyName || item.title || 'Unknown Property'}
            </Text>

            <View style={styles.infoRow}>
              <Icon name="location-on" size={14} color={COLORS.subText} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.location || item.city || 'Location unavailable'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="date-range" size={14} color={COLORS.subText} />
              <Text style={styles.infoText}>
                {item.startDate}{' '}
                <Text style={{ color: COLORS.placeholder }}>to</Text>{' '}
                {item.endDate}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>
              ₹{item.price ?? item.rent ?? '0'}
              <Text style={styles.priceSubText}>/mo</Text>
            </Text>
            <View style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Details</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>My Bookings</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => setSelectedTab(tab)}>
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}>
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
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
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Icon name="event-busy" size={50} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptyText}>
                You don't have any bookings matching this status right now.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Home')}>
                <Text style={styles.exploreButtonText}>Explore Properties</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.subText,
    fontWeight: '500',
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 10,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  /* Tabs Styling */
  tabWrapper: {
    height: 48,
    marginBottom: 10,
  },
  tabContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 18,
    height: 36,
    marginRight: 10,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subText,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '700',
  },

  /* List & Card Styling */
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra padding for tab bar if needed
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  propertyImage: {
    width: 100,
    height: 120,
    borderRadius: 14,
    backgroundColor: COLORS.disabled,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusIcon: {
    marginRight: 3,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  /* Card Content */
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingId: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateAppliedText: {
    fontSize: 10,
    color: COLORS.placeholder,
    fontWeight: '600',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.subText,
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  priceSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subText,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.subText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
})
