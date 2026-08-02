import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useFocusEffect } from '@react-navigation/native'

import COLORS from '../../theme/colors'
import { SERVER_URL } from '../../utils/config'
import { getWishlist, removeWishlist } from '../../services/wishlistService'

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
  })

  useFocusEffect(
    useCallback(() => {
      loadWishlist()
    }, [])
  )

  const loadWishlist = async () => {
    try {
      const response = await getWishlist()
      console.log(JSON.stringify(response.data, null, 2))
      // Handle the data array properly depending on your API structure
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || []
      setWishlist(data)
    } catch (error) {
      console.log(error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  // Custom Alert Handlers
  const showAlert = (title, message, type) => {
    setAlertConfig({ visible: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  const handleRemoveWishlist = async wishlistId => {
    try {
      await removeWishlist(wishlistId)
      // Remove from UI immediately
      setWishlist(prev => prev.filter(item => item.wishlistId !== wishlistId))
      showAlert('Removed', 'Property removed from your wishlist.', 'success')
    } catch (error) {
      console.log(error.response?.data || error.message)
      showAlert('Error', 'Unable to remove property from wishlist.', 'error')
    }
  }

  // Helper for alert styles
  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      default:
        return { icon: 'info', color: COLORS.info || COLORS.primary }
    }
  }

  const renderItem = ({ item }) => {
    const property = item.property
    if (!property) return null // Failsafe

    const imageUrl =
      property?.images?.length > 0
        ? `${SERVER_URL}/${property.images[0].imageUrl}`
        : null

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('PropertyDetails', { property: property })
          }>
          <View style={styles.imageContainer}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.image}
              onError={e => console.log('Image Error:', e.nativeEvent)}
            />
            <TouchableOpacity
              style={styles.favoriteButton}
              activeOpacity={0.8}
              onPress={() => handleRemoveWishlist(item.wishlistId)}>
              <Icon name="favorite" size={22} color={COLORS.error} />
            </TouchableOpacity>

            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>
                ₹{property?.price || property?.rent}
                <Text style={styles.priceTagSub}>/mo</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.details}>
          <Text style={styles.propertySubMeta}>
            {property?.propertyType || 'Apartment'} •{' '}
            {property?.furnishing || 'Furnished'}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {property?.title || property?.propertyName || 'Property Name'}
          </Text>

          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color={COLORS.subText} />
            <Text style={styles.location} numberOfLines={1}>
              {property?.city || property?.location || 'Unknown Location'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('PropertyDetails', { property: property })
            }>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Fixed Top Bar Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back-ios"
              size={20}
              color={COLORS.text}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={wishlist}
          keyExtractor={item => item.wishlistId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Icon name="favorite-border" size={60} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptyText}>
                Save your favorite properties here to easily view and book them
                later.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}>
                <Text style={styles.exploreButtonText}>Explore Properties</Text>
              </TouchableOpacity>
            </View>
          }
        />

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

  /* Top Bar Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 15 : 15,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backIcon: {
    marginLeft: 6, // centers the iOS arrow visually
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 45, // balances the back button width to perfectly center the title
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },

  /* Card Styles */
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
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.disabled,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceTagText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  priceTagSub: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },

  /* Card Details */
  details: {
    padding: 16,
  },
  propertySubMeta: {
    fontSize: 12,
    color: COLORS.subText,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: COLORS.subText,
    marginLeft: 4,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  /* Empty State Styles */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
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
    paddingHorizontal: 25,
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
})
