import React, { useContext, useState, useCallback, useEffect } from 'react'
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
import { useFocusEffect, useNavigation } from '@react-navigation/native'

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
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedPropertyType, setSelectedPropertyType] =
    useState('Property Type')
  const [selectedBudget, setSelectedBudget] = useState('Budget')
  const [selectedSort, setSelectedSort] = useState('Default')

  // Modal Visibility States
  const [cityModalVisible, setCityModalVisible] = useState(false)
  const [sortModalVisible, setSortModalVisible] = useState(false)
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

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

  // Combined Filter and Sort Engine
  useEffect(() => {
    let result = [...properties]

    if (search.trim()) {
      const query = search.toLowerCase().trim()
      result = result.filter(
        item =>
          item.title?.toLowerCase().includes(query) ||
          item.city?.toLowerCase().includes(query)
      )
    }

    if (selectedCity !== 'All Cities') {
      result = result.filter(
        property =>
          property.city?.trim().toLowerCase() ===
          selectedCity.trim().toLowerCase()
      )
    }

    if (selectedPropertyType !== 'Property Type') {
      result = result.filter(
        property =>
          property.propertyType?.toUpperCase() ===
          selectedPropertyType.toUpperCase()
      )
    }

    if (selectedBudget !== 'Budget') {
      result = result.filter(property => {
        const pPrice = Number(property.price || property.rent || 0)
        switch (selectedBudget) {
          case 'Below ₹10,000':
            return pPrice < 10000
          case '₹10,000 - ₹20,000':
            return pPrice >= 10000 && pPrice <= 20000
          case '₹20,000 - ₹50,000':
            return pPrice > 20000 && pPrice <= 50000
          case 'Above ₹50,000':
            return pPrice > 50000
          default:
            return true
        }
      })
    }

    if (selectedSort === 'Price: Low to High') {
      result.sort((a, b) => (a.price || a.rent) - (b.price || b.rent))
    } else if (selectedSort === 'Price: High to Low') {
      result.sort((a, b) => (b.price || b.rent) - (a.price || a.rent))
    }

    setFilteredProperties(result)
  }, [
    search,
    selectedCity,
    selectedPropertyType,
    selectedBudget,
    selectedSort,
    properties,
  ])

  const showAlert = (title, message, type, onClose = null) => {
    setAlertConfig({ visible: true, title, message, type, onClose })
  }

  const closeAlert = () => {
    const { onClose } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onClose) onClose()
  }

  const handleWishlist = async propertyId => {
    try {
      await addWishlist(propertyId)
      showAlert('Success', 'Property added to wishlist.', 'success', () =>
        navigation.navigate('Wishlist')
      )
    } catch (error) {
      showAlert(
        'Error',
        error.response?.data?.message || 'Unable to add property to wishlist.',
        'error'
      )
    }
  }

  const cities = [
    'All Cities',
    ...[
      ...new Map(
        properties
          .filter(item => Boolean(item.city))
          .map(item => [
            item.city.trim().toLowerCase(),
            item.city.trim().replace(/\b\w/g, c => c.toUpperCase()),
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

  const isWishlisted = propertyId => wishlistIds.includes(propertyId)

  const loadProperties = async () => {
    try {
      const response = await getProperties()
      const listData = response.data.data || []
      setProperties(listData)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
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
        return { icon: 'check-circle', color: COLORS.success || '#10B981' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#EF4444' }
      default:
        return { icon: 'warning', color: COLORS.warning || '#F59E0B' }
    }
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedCity('All Cities')
    setSelectedPropertyType('Property Type')
    setSelectedBudget('Budget')
    setSelectedSort('Default')
  }

  const activeFilterCount = [
    selectedCity !== 'All Cities',
    selectedPropertyType !== 'Property Type',
    selectedBudget !== 'Budget',
    selectedSort !== 'Default',
  ].filter(Boolean).length

  const renderProperty = ({ item }) => {
    const primaryImage =
      item.images?.length > 0
        ? `${SERVER_URL}/${item.images[0].imageUrl}`
        : null

    const wishlisted = isWishlisted(item.propertyId)

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.92}
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

            <View style={styles.imageScrim} pointerEvents="none" />

            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {item.propertyType || 'Listing'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.wishlistBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleWishlist(item.propertyId)}>
              <Icon
                name={wishlisted ? 'favorite' : 'favorite-border'}
                size={20}
                color={wishlisted ? COLORS.error || '#EF4444' : '#FFFFFF'}
              />
            </TouchableOpacity>

            <View style={styles.imageCountBadge}>
              <Icon name="photo-camera" size={12} color="#FFFFFF" />
              <Text style={styles.imageCountText}>
                {item.images?.length || 1}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Icon
              name="location-on"
              size={15}
              color={COLORS.primary || '#2563EB'}
            />
            <Text style={styles.propertySubMeta} numberOfLines={1}>
              {item.city} • Prime Area
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceText}>
                ₹{Number(item.price || item.rent || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.monthText}>/ month</Text>
            </View>

            <TouchableOpacity
              style={styles.priceBreakupBtn}
              onPress={() =>
                navigation.navigate('PropertyDetails', { property: item })
              }>
              <Text style={styles.priceBreakupText}>Details</Text>
              <Icon
                name="chevron-right"
                size={16}
                color={COLORS.primary || '#2563EB'}
              />
            </TouchableOpacity>
          </View>

          {item.description ? (
            <View style={styles.highlightsBox}>
              <Text style={styles.highlightsLabel}>Key Highlights</Text>
              <Text style={styles.highlightsText} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottomAction}>
          <TouchableOpacity
            style={styles.propertyDetailsBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('PropertyDetails', { property: item })
            }>
            <Text style={styles.propertyDetailsBtnText}>Explore Space</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconBtn, styles.whatsappBtn]}
            activeOpacity={0.85}
            onPress={() => handleWhatsApp(item.ownerPhone)}>
            <Icon name="chat" size={20} color={COLORS.success || '#10B981'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconBtn, styles.callBtn]}
            activeOpacity={0.85}
            onPress={() => handleCall(item.ownerPhone)}>
            <Icon name="call" size={20} color={COLORS.primary || '#2563EB'} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.updatedTimeText}>Updated recently</Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.card || '#FFFFFF'}
        />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary || '#2563EB'} />
          <Text style={styles.loadingText}>
            Curating available properties...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.card || '#FFFFFF'}
      />
      <View style={styles.container}>
        {/* Top Header & Search Bar */}
        <View style={styles.topSearchHeader}>
          <View style={styles.headerGreetingRow}>
            <View>
              <Text style={styles.greetingTitle}>
                Hello, {user?.name ? user.name.split(' ')[0] : 'Explorer'} 👋
              </Text>
              <Text style={styles.headerGreeting}>
                {filteredProperties.length} spaces available
              </Text>
            </View>
            <View style={styles.avatarCircle}>
              <Icon
                name="person"
                size={20}
                color={COLORS.primary || '#2563EB'}
              />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color={COLORS.placeholder || '#9CA3AF'}
              style={styles.searchLeadingIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search locality, city, landmark..."
              placeholderTextColor={COLORS.placeholder || '#9CA3AF'}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.clearSearchBtn}>
                <Icon
                  name="close"
                  size={14}
                  color={COLORS.subText || '#6B7280'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Horizontal Filter Chips Bar */}
        <View style={styles.filterBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}>
            <TouchableOpacity
              style={styles.filterChipIcon}
              activeOpacity={0.8}
              onPress={() => setSortModalVisible(true)}>
              <Icon
                name="swap-vert"
                size={20}
                color={COLORS.text || '#111827'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCity !== 'All Cities' && styles.activeFilterChip,
              ]}
              activeOpacity={0.8}
              onPress={() => setCityModalVisible(true)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedCity !== 'All Cities' && styles.activeFilterChipText,
                ]}>
                {selectedCity}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size={18}
                color={
                  selectedCity !== 'All Cities'
                    ? COLORS.primary || '#2563EB'
                    : COLORS.subText || '#6B7280'
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSort !== 'Default' && styles.activeFilterChip,
              ]}
              activeOpacity={0.8}
              onPress={() => setSortModalVisible(true)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedSort !== 'Default' && styles.activeFilterChipText,
                ]}>
                {selectedSort}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size={18}
                color={
                  selectedSort !== 'Default'
                    ? COLORS.primary || '#2563EB'
                    : COLORS.subText || '#6B7280'
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedPropertyType !== 'Property Type' &&
                  styles.activeFilterChip,
              ]}
              activeOpacity={0.8}
              onPress={() => setShowPropertyTypeModal(true)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedPropertyType !== 'Property Type' &&
                    styles.activeFilterChipText,
                ]}>
                {selectedPropertyType}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size={18}
                color={
                  selectedPropertyType !== 'Property Type'
                    ? COLORS.primary || '#2563EB'
                    : COLORS.subText || '#6B7280'
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedBudget !== 'Budget' && styles.activeFilterChip,
              ]}
              activeOpacity={0.8}
              onPress={() => setShowBudgetModal(true)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedBudget !== 'Budget' && styles.activeFilterChipText,
                ]}>
                {selectedBudget}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size={18}
                color={
                  selectedBudget !== 'Budget'
                    ? COLORS.primary || '#2563EB'
                    : COLORS.subText || '#6B7280'
                }
              />
            </TouchableOpacity>

            {activeFilterCount > 0 && (
              <TouchableOpacity
                style={styles.clearFilterChip}
                activeOpacity={0.8}
                onPress={clearAllFilters}>
                <Icon
                  name="close"
                  size={14}
                  color={COLORS.error || '#EF4444'}
                />
                <Text style={styles.clearFilterChipText}>Reset</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Feed List */}
        <FlatList
          data={filteredProperties}
          renderItem={renderProperty}
          keyExtractor={item => item.propertyId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon
                  name="search-off"
                  size={40}
                  color={COLORS.subText || '#6B7280'}
                />
              </View>
              <Text style={styles.emptyTitle}>No matching listings</Text>
              <Text style={styles.emptyText}>
                Try softening your search keywords or clearing active filters
              </Text>
              {(search || activeFilterCount > 0) && (
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={clearAllFilters}>
                  <Text style={styles.emptyResetBtnText}>
                    Reset All Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />

        {/* Sort Modal */}
        <Modal visible={sortModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Sort Order</Text>
              <FlatList
                data={['Default', 'Price: Low to High', 'Price: High to Low']}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedSort(item)
                      setSortModalVisible(false)
                    }}>
                    <Icon
                      name={
                        selectedSort === item
                          ? 'radio-button-checked'
                          : 'radio-button-unchecked'
                      }
                      size={20}
                      color={
                        selectedSort === item
                          ? COLORS.primary || '#2563EB'
                          : COLORS.placeholder || '#9CA3AF'
                      }
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
                activeOpacity={0.85}
                onPress={() => setSortModalVisible(false)}>
                <Text style={styles.closeText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* City Modal */}
        <Modal visible={cityModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Location</Text>
              <FlatList
                data={cities}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCity(item)
                      setCityModalVisible(false)
                    }}>
                    <Icon
                      name={
                        selectedCity === item
                          ? 'radio-button-checked'
                          : 'radio-button-unchecked'
                      }
                      size={20}
                      color={
                        selectedCity === item
                          ? COLORS.primary || '#2563EB'
                          : COLORS.placeholder || '#9CA3AF'
                      }
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
                activeOpacity={0.85}
                onPress={() => setCityModalVisible(false)}>
                <Text style={styles.closeText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Property Type Modal */}
        <Modal
          visible={showPropertyTypeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPropertyTypeModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Property Type</Text>
              {[
                { label: 'Apartment', value: 'APARTMENT', icon: 'apartment' },
                { label: 'House', value: 'HOUSE', icon: 'house' },
                { label: 'Villa', value: 'VILLA', icon: 'villa' },
                { label: 'PG', value: 'PG', icon: 'meeting-room' },
                { label: 'Room', value: 'ROOM', icon: 'bed' },
              ].map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.option}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedPropertyType(item.label)
                    setShowPropertyTypeModal(false)
                  }}>
                  <Icon
                    name={item.icon}
                    size={20}
                    color={
                      selectedPropertyType === item.label
                        ? COLORS.primary || '#2563EB'
                        : COLORS.subText || '#6B7280'
                    }
                    style={styles.optionIcon}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedPropertyType === item.label && {
                        color: COLORS.primary || '#2563EB',
                        fontWeight: '700',
                      },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedPropertyType('Property Type')
                  setShowPropertyTypeModal(false)
                }}>
                <Icon
                  name="refresh"
                  size={20}
                  color={COLORS.error || '#EF4444'}
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: COLORS.error || '#EF4444' },
                  ]}>
                  Reset Filter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.85}
                onPress={() => setShowPropertyTypeModal(false)}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Budget Modal */}
        <Modal
          visible={showBudgetModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBudgetModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Monthly Budget</Text>
              {[
                'Below ₹10,000',
                '₹10,000 - ₹20,000',
                '₹20,000 - ₹50,000',
                'Above ₹50,000',
              ].map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedBudget(item)
                    setShowBudgetModal(false)
                  }}>
                  <Icon
                    name="payments"
                    size={20}
                    color={
                      selectedBudget === item
                        ? COLORS.primary || '#2563EB'
                        : COLORS.subText || '#6B7280'
                    }
                    style={styles.optionIcon}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedBudget === item && {
                        color: COLORS.primary || '#2563EB',
                        fontWeight: '700',
                      },
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedBudget('Budget')
                  setShowBudgetModal(false)
                }}>
                <Icon
                  name="refresh"
                  size={20}
                  color={COLORS.error || '#EF4444'}
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: COLORS.error || '#EF4444' },
                  ]}>
                  Reset Filter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.85}
                onPress={() => setShowBudgetModal(false)}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Alert Modal */}
        <Modal transparent visible={alertConfig.visible} animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <View
                style={[
                  styles.alertIconContainer,
                  {
                    backgroundColor:
                      getAlertStyle(alertConfig.type).color + '18',
                  },
                ]}>
                <Icon
                  name={getAlertStyle(alertConfig.type).icon}
                  size={36}
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
                activeOpacity={0.85}
                onPress={closeAlert}>
                <Text style={styles.alertButtonText}>Got It</Text>
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
      backgroundColor: COLORS.card || '#FFFFFF',
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    loadingText: {
      marginTop: 14,
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Header & Search Bar */
    topSearchHeader: {
      paddingHorizontal: 20,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
      paddingBottom: 14,
      backgroundColor: COLORS.card || '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#F3F4F6',
    },
    headerGreetingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    greetingTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    headerGreeting: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.subText || '#6B7280',
      marginTop: 2,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: (COLORS.primary || '#2563EB') + '12',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#F9FAFB',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      height: 48,
      paddingHorizontal: 14,
    },
    searchLeadingIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: COLORS.text || '#111827',
      height: '100%',
    },
    clearSearchBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: COLORS.border || '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* Filter Chips Bar */
    filterBarWrapper: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#F3F4F6',
    },
    filterChipsRow: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      alignItems: 'center',
      gap: 8,
    },
    filterChipIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#F9FAFB',
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 38,
    },
    activeFilterChip: {
      borderColor: COLORS.primary || '#2563EB',
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.subText || '#4B5563',
      marginRight: 4,
    },
    activeFilterChipText: {
      color: COLORS.primary || '#2563EB',
      fontWeight: '700',
    },
    clearFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 38,
      borderRadius: 12,
      backgroundColor: (COLORS.error || '#EF4444') + '12',
    },
    clearFilterChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.error || '#EF4444',
      marginLeft: 4,
    },

    /* List & Cards */
    listContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 20,
      marginBottom: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.border || 'rgba(229, 231, 235, 0.8)',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    imageContainer: {
      height: 230,
      width: '100%',
      backgroundColor: '#E5E7EB',
      position: 'relative',
    },
    singleImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    typeBadge: {
      position: 'absolute',
      top: 14,
      left: 14,
      backgroundColor: 'rgba(255,255,255,0.92)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    wishlistBtn: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageCountBadge: {
      position: 'absolute',
      bottom: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    imageCountText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
      marginLeft: 4,
    },

    /* Card Details */
    details: {
      padding: 16,
    },
    titleRow: {
      marginBottom: 4,
    },
    propertyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text || '#111827',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    propertySubMeta: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
      marginLeft: 4,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    priceBlock: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    priceText: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
    },
    monthText: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.subText || '#6B7280',
      marginLeft: 2,
    },
    priceBreakupBtn: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priceBreakupText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.primary || '#2563EB',
    },
    highlightsBox: {
      backgroundColor: COLORS.background || '#F9FAFB',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border || '#F3F4F6',
    },
    highlightsLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: COLORS.subText || '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    highlightsText: {
      fontSize: 13,
      color: COLORS.text || '#374151',
      lineHeight: 18,
    },

    divider: {
      height: 1,
      backgroundColor: COLORS.border || '#F3F4F6',
      marginHorizontal: 16,
    },

    /* Card Bottom Action Bar */
    cardBottomAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 14,
      gap: 10,
    },
    propertyDetailsBtn: {
      flex: 1,
      backgroundColor: COLORS.primary || '#2563EB',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    propertyDetailsBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    actionIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    whatsappBtn: {
      borderColor: (COLORS.success || '#10B981') + '30',
      backgroundColor: (COLORS.success || '#10B981') + '10',
    },
    callBtn: {
      borderColor: (COLORS.primary || '#2563EB') + '30',
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
    },
    cardFooter: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 14,
    },
    updatedTimeText: {
      fontSize: 11,
      color: COLORS.placeholder || '#9CA3AF',
    },

    /* Empty View */
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 60,
      paddingHorizontal: 24,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.card || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      textAlign: 'center',
      marginBottom: 20,
    },
    emptyResetBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: COLORS.primary || '#2563EB',
    },
    emptyResetBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },

    /* Bottom Sheet Modals */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
      maxHeight: '80%',
      backgroundColor: COLORS.card || '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.border || '#E5E7EB',
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#F3F4F6',
    },
    modalItemText: {
      marginLeft: 12,
      fontSize: 14,
      color: COLORS.text || '#374151',
      fontWeight: '500',
    },
    modalItemSelectedText: {
      fontWeight: '700',
      color: COLORS.primary || '#2563EB',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#F3F4F6',
    },
    optionIcon: {
      marginRight: 12,
    },
    optionText: {
      fontSize: 14,
      color: COLORS.text || '#374151',
      fontWeight: '500',
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: COLORS.primary || '#2563EB',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    closeText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },

    /* Custom Alert */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      elevation: 10,
    },
    alertIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    alertTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 8,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
  })
