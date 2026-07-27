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
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { getBookings } from '../../services/bookingService'
import { useFocusEffect } from '@react-navigation/native'
import COLORS from '../../theme/colors'
import { getPropertyById } from '../../services/propertyService'

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

  const getStatusStyle = status => {
    switch (status) {
      case 'APPROVED':
        return styles.approved

      case 'PENDING':
        return styles.pending

      case 'REJECTED':
        return styles.rejected

      case 'CANCELLED':
        return styles.cancelled

      default:
        return styles.pending
    }
  }
  const filterBookings = status => {
    if (status === 'ALL') {
      setFilteredBookings(bookings)
      return
    }

    const data = bookings.filter(item => item.status === status)

    setFilteredBookings(data)
  }
  const onBookNow = async () => {
    try {
      await addBooking({
        propertyId,
        tenantId: user.userId,
        startDate,
        endDate,
      })

      Alert.alert('Success', 'Booking created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Booking'),
        },
      ])
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Booking failed.')
    }
  }

  const renderBooking = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Property Image Placeholder */}
        <Image
          source={
            propertyImages[item.propertyId]
              ? { uri: `${SERVER_URL}${propertyImages[item.propertyId]}` }
              : require('../../../assets/property_placeholder.png')
          }
          style={styles.propertyImage}
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.bookingTitle}>Booking #{item.bookingId}</Text>

            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.infoText}>
            <Text style={styles.label}>Property Name: </Text>
            {item.propertyName || item.title}
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>Location: </Text>
            {item.location || item.city}
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>Rent: </Text>₹{item.price ?? item.rent}
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>Property ID: </Text>
            {item.propertyId}
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>Tenant ID: </Text>
            {item.tenantId}
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>Start Date: </Text>
            {item.startDate}
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>End Date: </Text>
            {item.endDate}
          </Text>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate('BookingDetails', {
                booking: item,
              })
            }>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 10 }}>Loading Bookings...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Bookings</Text>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.bookingId.toString()}
        renderItem={renderBooking}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976D2']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Bookings Found</Text>
          </View>
        )}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 18,
  },

  tabContainer: {
    paddingHorizontal: 5,
    paddingVertical: 8,
    marginBottom: 15,
  },

  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    height: 40,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.subText,
  },

  activeTabText: {
    color: COLORS.white,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,

    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  propertyImage: {
    width: 95,
    height: 95,
    borderRadius: 12,
    backgroundColor: COLORS.placeholder,
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  bookingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  infoText: {
    fontSize: 14,
    color: COLORS.subText,
    marginBottom: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },

  approved: {
    backgroundColor: COLORS.success,
  },

  pending: {
    backgroundColor: COLORS.warning,
  },

  rejected: {
    backgroundColor: COLORS.error,
  },

  cancelled: {
    backgroundColor: COLORS.cancelled,
  },

  detailsButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',

    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  detailsButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.subText,
  },
})
