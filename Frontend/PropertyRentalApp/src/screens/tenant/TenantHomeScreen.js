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
  Linking,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useFocusEffect } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '../../provider/ThemeProvider'
import { AuthContext } from '../../provider/AuthProvider'
import { getProperties } from '../../services/propertyServicet'
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
  const [showBhkModal, setShowBhkModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false)
  const [selectedPropertyType, setSelectedPropertyType] =
    useState('Property Type')
  const [selectedBudget, setSelectedBudget] = useState('Budget')
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    onClose: null,
  })

  useFocusEffect(
    useCallback(() => {
      loadProperties()
      loadWishlist()
    }, [])
  )

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
      showAlert(
        'Error',
        error.response?.data?.message || 'Unable to add property.',
        'error'
      )
    }
  }

  const cities = [
    'All Cities',
    ...[
      ...new Map(
        properties.map(item => [
          item.city?.trim().toLowerCase(),
          item.city?.trim().replace(/\b\w/g, c => c.toUpperCase()),
        ])
      ).values(),
    ],
  ]

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

  const handleCall = phoneNumber => {
    if (!phoneNumber) {
      showAlert(
        'Not Available',
        'Owner phone number is not provided.',
        'warning'
      )
      return
    }
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleWhatsApp = phoneNumber => {
    if (!phoneNumber) {
      showAlert(
        'Not Available',
        'Owner phone number is not provided.',
        'warning'
      )
      return
    }
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`)
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      default:
        return { icon: 'warning', color: COLORS.warning }
    }
  }

  const renderProperty = ({ item }) => {
    const primaryImage =
      item.images?.length > 0
        ? `${SERVER_URL}/${item.images[0].imageUrl}`
        : null

    return (
      <View style={styles.card}>
        {/* Single Image Section */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() =>
            navigation.navigate('PropertyDetails', { property: item })
          }>
          <View style={styles.imageContainer}>
            <Image
              source={
                primaryImage
                  ? { uri: primaryImage }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.singleImage}
            />

            {/* Verified Badge */}
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={14} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>

            {/* Image Count Indicator */}
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>
                1/{item.images?.length || 1}
              </Text>
            </View>

            {/* Wishlist Heart Button */}
            <TouchableOpacity
              style={styles.wishlistBtn}
              onPress={() => handleWishlist(item.propertyId)}>
              <Icon
                name={
                  isWishlisted(item.propertyId) ? 'favorite' : 'favorite-border'
                }
                size={22}
                color={
                  isWishlisted(item.propertyId) ? COLORS.error : COLORS.white
                }
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Details Content Section */}
        <View style={styles.details}>
          <Text style={styles.propertySubMeta}>
            {item.propertyType} • {item.city}
          </Text>

          <Text style={styles.propertyTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              ₹{item.price || item.rent}/{' '}
              <Text style={styles.monthText}>Month</Text>
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PropertyDetails', { property: item })
              }>
              <Text style={styles.priceBreakupText}>see price breakup ›</Text>
            </TouchableOpacity>
          </View>

          {item.description ? (
            <Text style={styles.highlightsText} numberOfLines={1}>
              <Text style={{ fontWeight: '700', color: COLORS.text }}>
                Highlights:{' '}
              </Text>
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Bottom Action Bar per card */}
        <View style={styles.cardBottomAction}>
          <TouchableOpacity
            style={styles.propertyDetailsBtn}
            onPress={() =>
              navigation.navigate('PropertyDetails', { property: item })
            }>
            <Text style={styles.propertyDetailsBtnText}>Property Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => handleWhatsApp(item.ownerPhone)}>
            <Icon name="chat" size={20} color={COLORS.success} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => handleCall(item.ownerPhone)}>
            <Icon name="phone" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.updatedTimeText}>Updated 2d ago</Text>
      </View>
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Search Bar Header (Without Back Button) */}
        <View style={styles.topSearchHeader}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search locality, landmark..."
              placeholderTextColor={COLORS.placeholder}
              value={search}
              onChangeText={searchProperty}
            />
            <TouchableOpacity style={styles.searchIconButton}>
              <Icon name="search" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Dropdown Chips Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}>
          <TouchableOpacity style={styles.filterChipIcon}>
            <Icon name="swap-vert" size={18} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setCityModalVisible(true)}>
            <Text style={styles.filterChipText}>{selectedCity}</Text>
            <Icon name="keyboard-arrow-down" size={18} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setSortModalVisible(true)}>
            <Text style={styles.filterChipText}>Sort</Text>
            <Icon name="keyboard-arrow-down" size={18} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowPropertyTypeModal(true)}>
            <Text style={styles.filterChipText}>{selectedPropertyType}</Text>
            <Icon name="keyboard-arrow-down" size={18} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowBudgetModal(true)}>
            <Text style={styles.filterChipText}>{selectedBudget}</Text>
            <Icon name="keyboard-arrow-down" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </ScrollView>

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
                          properties.filter(
                            property =>
                              (property.city?.trim().toLowerCase() ===
                                item.trim().toLowerCase()) ===
                              item
                          )
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
        <Modal
          visible={showPropertyTypeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPropertyTypeModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {[
                { label: 'Apartment', value: 'APARTMENT' },
                { label: 'House', value: 'HOUSE' },
                { label: 'Villa', value: 'VILLA' },
                { label: 'PG', value: 'PG' },
                { label: 'Room', value: 'ROOM' },
              ].map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.option}
                  onPress={() => {
                    setSelectedPropertyType(item.label)

                    // Filter locally
                    const filtered = properties.filter(
                      property => property.propertyType === item.value
                    )

                    setFilteredProperties(filtered)
                    setShowPropertyTypeModal(false)
                  }}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  setSelectedPropertyType('Property Type')
                  setFilteredProperties(properties)
                  setShowPropertyTypeModal(false)
                }}>
                <Text style={[styles.optionText, { color: COLORS.primary }]}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showBudgetModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBudgetModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {[
                'Below ₹10,000',
                '₹10,000 - ₹20,000',
                '₹20,000 - ₹50,000',
                'Above ₹50,000',
              ].map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  onPress={() => {
                    setSelectedBudget(item)

                    let filtered = [...properties]

                    switch (item) {
                      case 'Below ₹10,000':
                        filtered = properties.filter(
                          property => property.price < 10000
                        )
                        break

                      case '₹10,000 - ₹20,000':
                        filtered = properties.filter(
                          property =>
                            property.price >= 10000 && property.price <= 20000
                        )
                        break

                      case '₹20,000 - ₹50,000':
                        filtered = properties.filter(
                          property =>
                            property.price > 20000 && property.price <= 50000
                        )
                        break

                      case 'Above ₹50,000':
                        filtered = properties.filter(
                          property => property.price > 50000
                        )
                        break

                      default:
                        filtered = [...properties]
                    }

                    setFilteredProperties(filtered)
                    setShowBudgetModal(false)
                  }}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  setSelectedBudget('Budget')
                  setFilteredProperties(properties)
                  setShowBudgetModal(false)
                }}>
                <Text style={[styles.optionText, { color: COLORS.primary }]}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
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

    /* Top Header Search Bar */
    topSearchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
      backgroundColor: COLORS.card,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
      height: 46,
      paddingLeft: 16,
      overflow: 'hidden',
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: COLORS.text,
    },
    searchIconButton: {
      backgroundColor: COLORS.primary,
      height: '100%',
      width: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* Filter Chips Row */
    filterChipsRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: COLORS.card,
      alignItems: 'center',
      height: 60,
    },
    filterChipIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: COLORS.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      backgroundColor: COLORS.card,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 20,
      paddingHorizontal: 14,
      height: 36,
      marginRight: 8,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.subText,
      marginRight: 4,
    },

    /* List & Card Styles */
    listContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      marginBottom: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },

    /* Single Image Section */
    imageContainer: {
      height: 200,
      width: '100%',
      backgroundColor: COLORS.disabled,
      position: 'relative',
    },
    singleImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    verifiedText: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.success,
      marginLeft: 3,
    },
    imageCountBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    imageCountText: {
      color: COLORS.white,
      fontSize: 11,
      fontWeight: '700',
    },
    wishlistBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* Details Section */
    details: {
      padding: 16,
    },
    propertySubMeta: {
      fontSize: 13,
      color: COLORS.subText,
      marginBottom: 4,
      fontWeight: '500',
    },
    propertyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 4,
    },
    propertyLocation: {
      fontSize: 13,
      color: COLORS.subText,
      marginBottom: 12,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    priceText: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
    },
    monthText: {
      fontSize: 13,
      fontWeight: '500',
      color: COLORS.subText,
    },
    priceBreakupText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.primary,
    },
    highlightsText: {
      fontSize: 13,
      color: COLORS.subText,
      backgroundColor: COLORS.background,
      padding: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },

    /* Card Bottom Action Bar */
    cardBottomAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 10,
    },
    propertyDetailsBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: COLORS.card,
    },
    propertyDetailsBtnText: {
      color: COLORS.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    actionIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.card,
    },
    updatedTimeText: {
      fontSize: 11,
      color: COLORS.placeholder,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },

    /* Empty State */
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 60,
    },
    emptyText: {
      marginTop: 15,
      fontSize: 15,
      color: COLORS.subText,
      fontWeight: '500',
    },

    /* Modal Styles */
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
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    modalItemText: {
      marginLeft: 15,
      fontSize: 16,
      color: COLORS.text,
      fontWeight: '500',
    },
    modalItemSelectedText: {
      fontWeight: '700',
      color: COLORS.primary,
    },
    closeButton: {
      marginTop: 25,
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    closeText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '700',
    },

    /* Alert Modal */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 25,
      alignItems: 'center',
      elevation: 10,
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
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 20,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    alertButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },

    modalContainer: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },

    option: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },

    optionText: {
      fontSize: 16,
      color: COLORS.text,
    },
  })
