import React, { useContext, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useFocusEffect } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'

import COLORS from '../../theme/colors'
import { AuthContext } from '../../provider/AuthProvider'
import { getProperties } from '../../services/propertyService'
import { SERVER_URL } from '../../utils/config'
import { addWishlist, getWishlist } from '../../services/wishlistService'

export default function TenantHomeScreen() {
  const navigation = useNavigation()
  const { user } = useContext(AuthContext)

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [cityModalVisible, setCityModalVisible] = useState(false)
  const [sortModalVisible, setSortModalVisible] = useState(false)
  const [selectedSort, setSelectedSort] = useState('Default')

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('All Cities')

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning', // 'success' | 'error' | 'warning'
    onClose: null,
  })

  useFocusEffect(
    useCallback(() => {
      loadProperties()
      loadWishlist()
    }, [])
  )

  // Custom Alert Handlers
  const showAlert = (title, message, type, onClose = null) => {
    setAlertConfig({ visible: true, title, message, type, onClose })
  }

  const closeAlert = () => {
    const { onClose } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onClose) {
      onClose()
    }
  }

  const handleWishlist = async propertyId => {
    try {
      await addWishlist(propertyId)
      showAlert('Success', 'Property added to wishlist.', 'success', () =>
        navigation.navigate('Wishlist')
      )
    } catch (error) {
      console.log(error.response?.data)
      console.log(error.response?.status)
      showAlert(
        'Error',
        error.response?.data?.message || 'Unable to add property.',
        'error'
      )
    }
  }

  const cities = ['All Cities', ...new Set(properties.map(item => item.city))]

  const loadWishlist = async () => {
    try {
      const response = await getWishlist()
      const ids = response.data.map(item => item.property.propertyId)
      setWishlistIds(ids)
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  const isWishlisted = propertyId => {
    return wishlistIds.includes(propertyId)
  }

  const loadProperties = async () => {
    try {
      const response = await getProperties()
      console.log(JSON.stringify(response.data.data, null, 2))
      setProperties(response.data.data)
      setFilteredProperties(response.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const searchProperty = text => {
    setSearch(text)
    const searchText = text.toLowerCase()
    const result = properties.filter(item => {
      return (
        item.title?.toLowerCase().includes(searchText) ||
        item.city?.toLowerCase().includes(searchText)
      )
    })
    setFilteredProperties(result)
  }

  const sortProperties = option => {
    let data = [...filteredProperties]

    if (option === 'LowToHigh') {
      data.sort((a, b) => (a.price ?? a.rent) - (b.price ?? b.rent))
    }
    if (option === 'HighToLow') {
      data.sort((a, b) => (b.price ?? b.rent) - (a.price ?? a.rent))
    }
    setFilteredProperties(data)
  }

  // Helper for alert styles
  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success || '#28A745' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#DC3545' }
      default:
        return { icon: 'warning', color: COLORS.warning || '#F5A623' }
    }
  }

  const renderProperty = ({ item }) => {
    const imageUrl =
      item.images?.length > 0
        ? `${SERVER_URL}/${item.images[0].imageUrl}`
        : null

    console.log('SERVER_URL =', SERVER_URL)
    console.log('IMAGE_URL =', imageUrl)

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('PropertyDetails', { property: item })
        }>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={
              imageUrl
                ? { uri: imageUrl }
                : require('../../../assets/property_placeholder.png')
            }
            style={styles.propertyImage}
            onLoad={() => console.log('Image Loaded')}
            onError={e => console.log('Image Error:', e.nativeEvent)}
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>₹{item.price}/mo</Text>
          </View>
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => handleWishlist(item.propertyId)}>
            <Icon
              name={
                isWishlisted(item.propertyId) ? 'favorite' : 'favorite-border'
              }
              size={24}
              color={isWishlisted(item.propertyId) ? '#FF474C' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Details Section */}
        <View style={styles.details}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.chipText}>{item.city}</Text>
            </View>
            <View style={styles.chip}>
              <Icon name="home" size={16} color={COLORS.primary} />
              <Text style={styles.chipText}>{item.propertyType}</Text>
            </View>
            <View style={styles.chip}>
              <Icon name="star" size={16} color="#FFC107" />
              <Text style={styles.chipText}>4.8</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                navigation.navigate('PropertyDetails', { property: item })
              }>
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() =>
                navigation.navigate('BookingForm', { property: item })
              }>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding great properties...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>
          Hello 👋 {user?.name || user?.fullName || user?.firstName || 'Tenant'}
        </Text>
        <Text style={styles.title}>Find Your Dream{'\n'}Property</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={24}
          color={COLORS.placeholder}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by property or city..."
          placeholderTextColor={COLORS.placeholder}
          value={search}
          onChangeText={searchProperty}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.cityButton}
          onPress={() => setCityModalVisible(true)}>
          <Icon name="location-pin" size={20} color={COLORS.primary} />
          <Text style={styles.cityText}>{selectedCity}</Text>
          <Icon name="keyboard-arrow-down" size={20} color={COLORS.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}>
          <Icon name="sort" size={20} color={COLORS.white} />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Featured Properties</Text>

      {/* Properties List */}
      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={item => item.propertyId.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color={COLORS.placeholder} />
            <Text style={styles.emptyText}>No properties found.</Text>
          </View>
        )}
      />

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sort Properties</Text>
            <FlatList
              data={['Default', 'Price: Low to High', 'Price: High to Low']}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSort(item)
                    let data = [...properties]
                    switch (item) {
                      case 'Price: Low to High':
                        data.sort((a, b) => a.price - b.price)
                        break
                      case 'Price: High to Low':
                        data.sort((a, b) => b.price - a.price)
                        break
                      default:
                        data = [...properties]
                    }
                    setFilteredProperties(data)
                    setSortModalVisible(false)
                  }}>
                  <Icon
                    name={
                      selectedSort === item
                        ? 'radio-button-checked'
                        : 'radio-button-unchecked'
                    }
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedSort === item && styles.modalItemSelectedText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSortModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={cityModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select City</Text>
            <FlatList
              data={cities}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCity(item)
                    if (item === 'All Cities') {
                      setFilteredProperties(properties)
                    } else {
                      setFilteredProperties(
                        properties.filter(property => property.city === item)
                      )
                    }
                    setCityModalVisible(false)
                  }}>
                  <Icon
                    name={
                      selectedCity === item
                        ? 'radio-button-checked'
                        : 'radio-button-unchecked'
                    }
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedCity === item && styles.modalItemSelectedText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCityModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor: getAlertStyle(alertConfig.type).color + '15',
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

            <TouchableOpacity
              style={[
                styles.alertButton,
                { backgroundColor: getAlertStyle(alertConfig.type).color },
              ]}
              activeOpacity={0.8}
              onPress={closeAlert}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
    paddingHorizontal: 20,
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

  /* Header Styles */
  header: {
    marginBottom: 20,
  },
  welcome: {
    fontSize: 16,
    color: COLORS.subText || '#6C757D',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginTop: 8,
    lineHeight: 38,
  },

  /* Search Styles */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
    borderWidth: 1,
    borderColor: COLORS.border || '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text || '#212529',
    height: '100%',
  },

  /* Filter & Sort Styles */
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card || '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border || '#E9ECEF',
    marginRight: 12,
  },
  cityText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text || '#212529',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary || '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sortButtonText: {
    color: COLORS.white || '#FFFFFF',
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '700',
  },

  /* List & Card Styles */
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text || '#212529',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 20,
    marginBottom: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.placeholder || '#E9ECEF',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: COLORS.primary || '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceTagText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Details Section */
  details: {
    padding: 18,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (COLORS.primary || '#007BFF') + '15', // 15% opacity
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  chipText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary || '#007BFF',
  },
  description: {
    fontSize: 14,
    color: COLORS.subText || '#6C757D',
    lineHeight: 22,
    marginBottom: 15,
  },

  /* Buttons */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#007BFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: COLORS.primary || '#007BFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bookButton: {
    flex: 1,
    backgroundColor: COLORS.primary || '#007BFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bookButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.subText || '#6C757D',
    fontWeight: '500',
  },

  /* Filter Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.card || '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#E9ECEF',
  },
  modalItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.text || '#212529',
    fontWeight: '500',
  },
  modalItemSelectedText: {
    fontWeight: '700',
    color: COLORS.primary || '#007BFF',
  },
  closeButton: {
    marginTop: 25,
    backgroundColor: COLORS.primary || '#007BFF',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Custom Alert Modal Styling */
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
    marginBottom: 25,
    lineHeight: 22,
  },
  alertButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
