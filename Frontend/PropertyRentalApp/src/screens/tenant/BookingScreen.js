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
          style: styles.approved,
          icon: 'check-circle',
          text: 'Approved',
        }
      case 'PENDING':
        return {
          style: styles.pending,
          icon: 'hourglass-empty',
          text: 'Pending',
        }
      case 'REJECTED':
        return { style: styles.rejected, icon: 'cancel', text: 'Rejected' }
      case 'CANCELLED':
        return { style: styles.cancelled, icon: 'block', text: 'Cancelled' }
      default:
        return { style: styles.pending, icon: 'info', text: status }
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
        activeOpacity={0.8}
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
              size={14}
              color="#FFF"
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.bookingId}>Booking #{item.bookingId}</Text>
            <Text style={styles.propertyName} numberOfLines={1}>
              {item.propertyName || item.title || 'Unknown Property'}
            </Text>

            <View style={styles.infoRow}>
              <Icon
                name="location-on"
                size={16}
                color={COLORS.subText || '#6C757D'}
              />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.location || item.city || 'Location unavailable'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon
                name="date-range"
                size={16}
                color={COLORS.subText || '#6C757D'}
              />
              <Text style={styles.infoText}>
                {item.startDate} to {item.endDate}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>
              ₹{item.price ?? item.rent ?? '0'}
              <Text style={styles.priceSubText}>/mo</Text>
            </Text>
            <View style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>View</Text>
              <Icon
                name="chevron-right"
                size={18}
                color={COLORS.primary || '#007BFF'}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary || '#007BFF'} />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    )
  }

  const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Bookings</Text>

      {/* Filter Tabs */}
      <View style={styles.tabWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
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
            colors={[COLORS.primary || '#007BFF']}
            tintColor={COLORS.primary || '#007BFF'}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon
              name="event-busy"
              size={60}
              color={COLORS.placeholder || '#CED4DA'}
            />
            <Text style={styles.emptyText}>
              No bookings found for this status.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.exploreButtonText}>Explore Properties</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.subText || '#6C757D',
    fontWeight: '500',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  /* Tabs Styling */
  tabWrapper: {
    height: 50,
    marginBottom: 10,
  },
  tabContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: COLORS.card || '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border || '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary || '#007BFF',
    borderColor: COLORS.primary || '#007BFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.subText || '#6C757D',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  /* List & Card Styling */
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 15,
  },
  propertyImage: {
    width: 110,
    height: 125,
    borderRadius: 16,
    backgroundColor: COLORS.placeholder || '#E9ECEF',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  approved: {
    backgroundColor: COLORS.success || '#28A745',
  },
  pending: {
    backgroundColor: COLORS.warning || '#F5A623',
  },
  rejected: {
    backgroundColor: COLORS.error || '#DC3545',
  },
  cancelled: {
    backgroundColor: COLORS.cancelled || '#6C757D',
  },

  /* Card Content */
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookingId: {
    fontSize: 12,
    color: COLORS.primary || '#007BFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  propertyName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.subText || '#6C757D',
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text || '#212529',
  },
  priceSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subText || '#6C757D',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (COLORS.primary || '#007BFF') + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  detailsButtonText: {
    color: COLORS.primary || '#007BFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.subText || '#6C757D',
    fontWeight: '500',
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary || '#007BFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
})
