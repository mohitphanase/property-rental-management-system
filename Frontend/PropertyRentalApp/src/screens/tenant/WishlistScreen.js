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
    type: 'warning', // 'success' | 'error' | 'warning'
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
      setWishlist(response.data)
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
        return { icon: 'check-circle', color: COLORS.success || '#28A745' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#DC3545' }
      default:
        return { icon: 'info', color: COLORS.warning || '#F5A623' }
    }
  }

  const renderItem = ({ item }) => {
    const property = item.property
    const imageUrl =
      property?.images?.length > 0
        ? `${SERVER_URL}/${property.images[0].imageUrl}`
        : null

    return (
      <View style={styles.card}>
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
            <Icon name="favorite" size={24} color="#FF474C" />
          </TouchableOpacity>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>
              ₹{property?.price || property?.rent}/mo
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {property?.title || property?.propertyName}
          </Text>

          <View style={styles.locationRow}>
            <Icon
              name="location-on"
              size={16}
              color={COLORS.subText || '#6C757D'}
            />
            <Text style={styles.location} numberOfLines={1}>
              {property?.city || property?.location}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('PropertyDetails', {
                property: property,
              })
            }>
            <Text style={styles.buttonText}>View Property</Text>
            <Icon
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary || '#007BFF'} />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Wishlist</Text>

      <FlatList
        data={wishlist}
        keyExtractor={item => item.wishlistId.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Icon
                name="favorite-border"
                size={60}
                color={COLORS.primary || '#007BFF'}
              />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptyText}>
              Save your favorite properties here to view them later.
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
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* Card Styles */
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Card Details */
  details: {
    padding: 18,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    fontSize: 14,
    color: COLORS.subText || '#6C757D',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary || '#007BFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
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
    backgroundColor: (COLORS.primary || '#007BFF') + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.subText || '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  exploreButton: {
    backgroundColor: COLORS.primary || '#007BFF',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 14,
  },
  exploreButtonText: {
    color: '#FFFFFF',
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
