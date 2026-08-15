import React, { useState, useCallback, useContext } from 'react'
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

import { ThemeContext } from '../../provider/ThemeProvider'
import { SERVER_URL } from '../../utils/config'
import { getWishlist, removeWishlist } from '../../services/wishlistService'

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

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
        return { icon: 'check-circle', color: COLORS.success || '#10B981' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#EF4444' }
      default:
        return {
          icon: 'info',
          color: COLORS.info || COLORS.primary || '#3B82F6',
        }
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
          activeOpacity={0.95}
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
            {/* Dark gradient overlay for text readability */}
            <View style={styles.imageScrim} pointerEvents="none" />

            {/* Remove from wishlist button */}
            <TouchableOpacity
              style={styles.favoriteButton}
              activeOpacity={0.8}
              onPress={() => handleRemoveWishlist(item.wishlistId)}>
              <Icon
                name="favorite"
                size={20}
                color={COLORS.error || '#EF4444'}
              />
            </TouchableOpacity>

            {/* Floating Price Tag */}
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>
                ₹
                {Number(property?.price || property?.rent || 0).toLocaleString(
                  'en-IN'
                )}
                <Text style={styles.priceTagSub}> / month</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.details}>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {property?.propertyType || 'Apartment'}
              </Text>
            </View>
            <Text style={styles.propertySubMeta}>
              • {property?.furnishing || 'Furnished'}
            </Text>
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {property?.title || property?.propertyName || 'Property Name'}
          </Text>

          <View style={styles.locationRow}>
            <Icon
              name="location-pin"
              size={16}
              color={COLORS.primary || '#2563EB'}
            />
            <Text style={styles.location} numberOfLines={1}>
              {property?.city || property?.location || 'Unknown Location'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('PropertyDetails', { property: property })
            }>
            <Text style={styles.buttonText}>View Details</Text>
            <Icon
              name="arrow-forward"
              size={16}
              color={COLORS.primary || '#2563EB'}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary || '#2563EB'} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
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
        {/* Modern Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              size={22}
              color={COLORS.text || '#111827'}
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
                <Icon
                  name="favorite-border"
                  size={48}
                  color={COLORS.primary || '#2563EB'}
                />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptyText}>
                Save your favorite properties here to easily view and book them
                later.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                activeOpacity={0.85}
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
                      getAlertStyle(alertConfig.type).color + '1A',
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
      fontSize: 15,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Modern Top Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 14,
      paddingTop:
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
      backgroundColor: COLORS.card || '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border || '#F3F4F6',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.background || '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text || '#111827',
    },
    headerSpacer: {
      width: 40,
    },

    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },

    /* Refined Card Styles */
    card: {
      backgroundColor: COLORS.card || '#FFFFFF',
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.border || 'rgba(229, 231, 235, 0.8)',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: 220,
      backgroundColor: '#E5E7EB',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    favoriteButton: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    priceTag: {
      position: 'absolute',
      bottom: 14,
      left: 14,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backdropFilter: 'blur(4px)',
    },
    priceTagText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    priceTagSub: {
      fontSize: 12,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
    },

    /* Refined Details Section */
    details: {
      padding: 16,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    typeBadge: {
      backgroundColor: (COLORS.primary || '#2563EB') + '12',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 6,
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.primary || '#2563EB',
      textTransform: 'uppercase',
    },
    propertySubMeta: {
      fontSize: 12,
      color: COLORS.subText || '#6B7280',
      fontWeight: '600',
    },
    name: {
      fontSize: 19,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 6,
      lineHeight: 24,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    location: {
      fontSize: 14,
      color: COLORS.subText || '#4B5563',
      marginLeft: 4,
      fontWeight: '500',
      flex: 1,
    },
    button: {
      flexDirection: 'row',
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    buttonText: {
      color: COLORS.primary || '#2563EB',
      fontWeight: '700',
      fontSize: 15,
    },

    /* Modern Empty State */
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 24,
    },
    emptyIconBox: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: (COLORS.primary || '#2563EB') + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: (COLORS.primary || '#2563EB') + '20',
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text || '#111827',
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    exploreButton: {
      backgroundColor: COLORS.primary || '#2563EB',
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 14,
      elevation: 2,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    exploreButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },

    /* Custom Alert Modal */
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
      color: COLORS.subText || '#4B5563',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
  })
