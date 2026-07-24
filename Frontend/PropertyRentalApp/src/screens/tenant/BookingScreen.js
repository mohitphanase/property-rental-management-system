import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { getBookings } from '../../services/bookingService'

export default function BookingScreen() {
  const navigation = useNavigation()

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('ALL')

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    filterBookings(selectedTab)
  }, [bookings, selectedTab])

  const loadBookings = async () => {
    try {
      const response = await getBookings()

      console.log(response.data)

      setBookings(response.data.data)
    } catch (error) {
      console.log('Status:', error.response?.status)
      console.log('Data:', error.response?.data)
      console.log('Message:', error.message)
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

  const getStatusStyle = status => {
    switch (status) {
      case 'APPROVED':
        return styles.approved

      case 'PENDING':
        return styles.pending

      case 'REJECTED':
        return styles.rejected

      default:
        return styles.pending
    }
  }
  const renderBooking = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Property Image Placeholder */}
        {/* <Image
          source={require('')}
          style={styles.propertyImage}
          resizeMode="cover"
        /> */}

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.bookingTitle}>Booking #{item.bookingId}</Text>

            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.infoText}>Property ID : {item.propertyId}</Text>

          <Text style={styles.infoText}>Tenant ID : {item.tenantId}</Text>

          <Text style={styles.infoText}>Start Date : {item.startDate}</Text>

          <Text style={styles.infoText}>End Date : {item.endDate}</Text>

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
      <View style={styles.tabContainer}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
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
      </View>

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
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  tab: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  activeTab: {
    backgroundColor: '#1976D2',
  },

  tabText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },

  activeTabText: {
    color: '#FFF',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,

    elevation: 5,

    shadowColor: '#000',
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
    backgroundColor: '#DDD',
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
    color: '#222',
  },

  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  approved: {
    backgroundColor: '#4CAF50',
  },

  pending: {
    backgroundColor: '#FF9800',
  },

  rejected: {
    backgroundColor: '#F44336',
  },

  detailsButton: {
    marginTop: 12,
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  detailsButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#777',
  },
})
