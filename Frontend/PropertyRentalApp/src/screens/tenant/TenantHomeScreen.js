import React, { useContext, useEffect, useState, useCallback } from 'react'

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { useFocusEffect } from '@react-navigation/native'

import COLORS from '../../theme/colors'
import { AuthContext } from '../../provider/AuthProvider'
import { getProperties } from '../../services/propertyService'
import { SERVER_URL } from '../../utils/config'
import { useNavigation } from '@react-navigation/native'
import { addWishlist, getWishlist } from '../../services/wishlistService'

export default function TenantHomeScreen() {
  const navigation = useNavigation()
  const { user } = useContext(AuthContext)

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [cityModalVisible, setCityModalVisible] = useState(false)

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedCity, setSelectedCity] = useState('All Cities')

  useFocusEffect(
    useCallback(() => {
      loadProperties()
      loadWishlist()
    }, [])
  )

  const handleWishlist = async propertyId => {
    try {
      await addWishlist(propertyId)

      Alert.alert('Success', 'Property added to wishlist.')

      navigation.navigate('Wishlist')
    } catch (error) {
      console.log(error.response?.data)
      console.log(error.response?.status)

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to add property.'
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
  const showFilter = () => {
    Alert.alert('Filter Properties', 'Choose Property Type', [
      {
        text: 'Apartment',
        onPress: () => console.log('Apartment'),
      },
      {
        text: 'Villa',
        onPress: () => console.log('Villa'),
      },
      {
        text: 'House',
        onPress: () => console.log('House'),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ])
  }

  const loadProperties = async () => {
    try {
      const response = await getProperties()

      console.log(response.data.data)

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

  const showCityFilter = () => {
    const cities = [
      'All Cities',
      ...new Set(properties.map(item => item.city)),
      'Cancel',
    ]

    Alert.alert(
      'Select City',
      'Choose a city',
      cities.map(city => ({
        text: city,
        onPress: () => {
          if (city === 'Cancel') return

          setSelectedCity(city)

          if (city === 'All Cities') {
            setFilteredProperties(properties)
          } else {
            setFilteredProperties(properties.filter(item => item.city === city))
          }
        },
      }))
    )
  }
  const showSortOptions = () => {
    Alert.alert('Sort By', '', [
      {
        text: 'Price : Low to High',
        onPress: () => sortProperties('LowToHigh'),
      },
      {
        text: 'Price : High to Low',
        onPress: () => sortProperties('HighToLow'),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ])
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

  const renderProperty = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      {/* Property Image */}
      <View>
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require('../../../assets/property_placeholder.png')
          }
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => handleWishlist(item.propertyId)}>
          <Icon
            name={
              isWishlisted(item.propertyId) ? 'favorite' : 'favorite-border'
            }
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Property Details */}

      <View style={styles.details}>
        <Text style={styles.price}>₹{item.price}/Month</Text>

        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.row}>
          <Icon name="location-on" size={18} color="red" />
          <Text style={styles.info}>{item.city}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="home" size={18} color={COLORS.primary} />
          <Text style={styles.info}>{item.propertyType}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="star" size={18} color="#FFC107" />
          <Text style={styles.info}>4.8</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate('PropertyDetails', {
                property: item,
              })
            }>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() =>
              navigation.navigate('BookingForm', {
                property: item,
              })
            }>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Hello 👋 {user?.name || user?.fullName || user?.firstName || 'Tenant'}
      </Text>

      <Text style={styles.title}>Find Your Dream Property</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Search by property or city..."
          placeholderTextColor={COLORS.placeholder}
          value={search}
          onChangeText={searchProperty}
        />
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.cityButton}
          onPress={() => setCityModalVisible(true)}>
          <Icon name="location-on" size={20} color={COLORS.primary} />
          <Text style={styles.cityText}>{selectedCity}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortButton} onPress={showSortOptions}>
          <Icon name="sort" size={20} color={COLORS.white} />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Featured Properties</Text>

      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={item => item.propertyId.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />
      <Modal visible={cityModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select City</Text>

            <FlatList
              data={cities}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
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

                  <Text style={styles.cityItemText}>{item}</Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  detailsButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  search: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterBtn: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sort: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 25,
    elevation: 4,
  },

  image: {
    width: '100%',
    height: 220,
  },

  wishlistBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  details: {
    padding: 15,
  },

  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.success,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 5,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  info: {
    marginLeft: 5,
    color: COLORS.subText,
  },

  description: {
    marginTop: 10,
    color: COLORS.subText,
    lineHeight: 22,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  detailsBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  bookBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  welcome: {
    fontSize: 18,
    color: COLORS.subText,
    fontWeight: '500',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 5,
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  search: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,

    borderWidth: 1,
    borderColor: COLORS.border,

    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sortButton: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',

    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  propertyImage: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.placeholder,
  },

  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 15,
    marginTop: 15,
  },

  location: {
    fontSize: 15,
    color: COLORS.subText,
    marginHorizontal: 15,
    marginTop: 8,
  },

  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
    marginHorizontal: 15,
    marginTop: 12,
  },

  detailsButton: {
    margin: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  detailsText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },

  emptyText: {
    fontSize: 18,
    color: COLORS.subText,
    fontWeight: '600',
  },

  description: {
    fontSize: 14,
    color: COLORS.subText,
    marginHorizontal: 15,
    marginTop: 6,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  bookButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cityText: {
    marginLeft: 6,
    fontWeight: '600',
    color: COLORS.text,
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },

  sortButtonText: {
    color: COLORS.white,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },

  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  cityItemText: {
    marginLeft: 12,
    fontSize: 17,
    color: COLORS.text,
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  closeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})
