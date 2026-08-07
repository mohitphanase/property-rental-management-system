import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  Platform,
  Share,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ThemeContext } from '../../provider/ThemeProvider'
import { SERVER_URL } from '../../utils/config'
import { addWishlist, getWishlist } from '../../services/wishlistService'

export default function PropertyDetailsScreen({ route, navigation }) {
  // Safe extraction of property to prevent undefined property errors
  const property = route?.params?.property || {}
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  useEffect(() => {
    if (property?.propertyId) {
      loadWishlistStatus()
    }
  }, [property?.propertyId])

  const loadWishlistStatus = async () => {
    try {
      const response = await getWishlist()

      const wishlist = Array.isArray(response.data)
        ? response.data
        : response.data?.data || []

      const exists = wishlist.some(
        item =>
          String(item.property?.propertyId) === String(property?.propertyId)
      )

      setIsWishlisted(exists)
    } catch (error) {
      console.log('Wishlist Load Error:', error)
    }
  }

  // Safe evaluation using optional chaining
  const imageUrl =
    property?.images && property.images.length > 0
      ? `${SERVER_URL}/${property.images[0].imageUrl}`
      : null

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
  })

  const showAlert = (title, message, type) => {
    setAlertConfig({ visible: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  const contactOwner = () => {
    if (!property?.ownerPhone) {
      showAlert(
        'Not Available',
        'The owner has not provided a contact number for this property.',
        'warning'
      )
      return
    }
    Linking.openURL(`tel:${property.ownerPhone}`)
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property?.title || 'Property'} in ${property?.city || 'City'} for ₹${property?.price || 0}/mo`,
      })
    } catch (error) {
      console.log('Error sharing:', error.message)
    }
  }

  const handleWishlist = async () => {
    if (!property?.propertyId) return

    if (isWishlisted) {
      showAlert('Notice', 'This property is already in your wishlist.', 'info')
      return
    }

    try {
      await addWishlist(property.propertyId)
      setIsWishlisted(true)
      showAlert('Success', 'Property added to wishlist.', 'success')
    } catch (error) {
      console.log('Wishlist Error:', error.response?.data)
      showAlert(
        'Notice',
        error.response?.data?.message || 'Unable to add property to wishlist.',
        'warning'
      )
    }
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      case 'info':
        return { icon: 'info', color: COLORS.primary }
      default:
        return { icon: 'warning', color: COLORS.warning }
    }
  }

  // Fallback screen if property payload is unselected
  if (!property?.propertyId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fallbackContainer}>
          <TouchableOpacity
            style={styles.backButtonFallback}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Icon name="info-outline" size={48} color={COLORS.subText} />
          <Text style={styles.fallbackText}>Property details not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header Image Section */}
          <View style={styles.imageContainer}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.image}
            />
            {/* Top Navigation / Action Icons */}
            <View style={styles.topActionRow}>
              <TouchableOpacity
                style={styles.circleIconButton}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={22} color={COLORS.black} />
              </TouchableOpacity>
              <View style={styles.topRightIcons}>
                <TouchableOpacity
                  style={styles.circleIconButton}
                  onPress={handleShare}>
                  <Icon name="share" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.circleIconButton, { marginLeft: 10 }]}
                  onPress={handleWishlist}>
                  <Icon
                    key={isWishlisted ? 'filled' : 'outline'}
                    name={isWishlisted ? 'favorite' : 'favorite-border'}
                    size={22}
                    color={isWishlisted ? COLORS.error : COLORS.black}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Title & Price Card */}
          <View style={styles.titlePriceCard}>
            <View style={{ flex: 1, marginRight: 15 }}>
              <Text style={styles.title}>{property.title}</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {property.city} • {property.description || 'Near Main Road'}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>₹{property.price}</Text>
              <Text style={styles.priceSubText}>Rent/Person</Text>
            </View>
          </View>

          {/* Overview Grid Section */}
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Icon name="home" size={22} color={COLORS.subText} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.overviewLabel}>Property Type</Text>
                <Text style={styles.overviewValue}>
                  {property.propertyType}
                </Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icon name="location-city" size={22} color={COLORS.subText} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.overviewLabel}>City</Text>
                <Text style={styles.overviewValue}>{property.city}</Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icon name="person" size={22} color={COLORS.subText} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.overviewLabel}>Owner</Text>
                <Text style={styles.overviewValue}>{property.ownerName}</Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icon name="phone" size={22} color={COLORS.subText} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.overviewLabel}>Contact</Text>
                <Text style={styles.overviewValue}>
                  {property.ownerPhone || 'Not Available'}
                </Text>
              </View>
            </View>
          </View>

          {/* Neighbourhood Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Neighbourhood</Text>
            <View style={styles.neighbourhoodRow}>
              <Icon name="location-pin" size={20} color={COLORS.error} />
              <Text style={styles.neighbourhoodText}>
                {property.city} • Prime Location
              </Text>
            </View>
          </View>

          {/* Property Description */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Property Description</Text>
            <Text style={styles.descriptionText}>
              {property.description?.trim()
                ? property.description
                : 'No description has been provided for this property.'}
            </Text>
          </View>

          {/* Reviews Navigation Card */}
          <View style={styles.sectionCard}>
            <View style={styles.reviewHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sectionHeaderTitle}>Reviews & Ratings</Text>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.headerButtonsRow}>
                {/* 1. Navigate to My Reviews passing propertyId and propertyTitle */}
                <TouchableOpacity
                  style={styles.myReviewsHeaderBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('MyReviews', {
                      propertyId: property.propertyId,
                      propertyTitle: property.title,
                    })
                  }>
                  <Icon name="person" size={16} color={COLORS.primary} />
                  <Text style={styles.myReviewsHeaderText}>My Reviews</Text>
                </TouchableOpacity>

                {/* 2. Navigate to ReviewScreen passing propertyId and propertyTitle */}
                <TouchableOpacity
                  style={styles.writeReviewHeaderBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ReviewScreen', {
                      propertyId: property.propertyId,
                      propertyTitle: property.title,
                    })
                  }>
                  <Icon name="rate-review" size={16} color={COLORS.primary} />
                  <Text style={styles.writeReviewHeaderText}>Reviews</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewReviewsCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ReviewScreen', {
                  propertyId: property.propertyId,
                  propertyTitle: property.title,
                })
              }>
              <View style={styles.viewReviewsContent}>
                <Icon name="reviews" size={24} color={COLORS.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.viewReviewsTitle}>Property Reviews</Text>
                  <Text style={styles.viewReviewsSub}>
                    Tap to view all tenant feedback for this property
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={COLORS.subText} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomContactBtn}
            activeOpacity={0.8}
            onPress={contactOwner}>
            <Text style={styles.bottomContactText}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scheduleVisitBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BookingForm', { property })}>
            <Text style={styles.scheduleVisitText}>Booking</Text>
          </TouchableOpacity>
        </View>

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

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    fallbackContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    backButtonFallback: {
      position: 'absolute',
      top: 20,
      left: 20,
      padding: 8,
    },
    fallbackText: {
      fontSize: 16,
      color: COLORS.subText,
      marginTop: 10,
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },

    /* Image & Header Section */
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 280,
      backgroundColor: COLORS.disabled,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    topActionRow: {
      position: 'absolute',
      top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    topRightIcons: {
      flexDirection: 'row',
    },
    circleIconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: COLORS.white,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },

    /* Title & Price Card */
    titlePriceCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: COLORS.card,
      padding: 16,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 6,
    },
    locationText: {
      fontSize: 13,
      color: COLORS.subText,
      lineHeight: 18,
    },
    priceContainer: {
      alignItems: 'flex-end',
    },
    priceText: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
    },
    priceSubText: {
      fontSize: 11,
      color: COLORS.subText,
      fontWeight: '600',
      marginTop: 2,
    },

    /* Section Cards */
    sectionCard: {
      backgroundColor: COLORS.card,
      padding: 16,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    sectionHeaderTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 14,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    overviewItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    overviewLabel: {
      fontSize: 11,
      color: COLORS.subText,
      fontWeight: '500',
    },
    overviewValue: {
      fontSize: 13,
      color: COLORS.text,
      fontWeight: '700',
      marginTop: 2,
    },
    neighbourhoodRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    neighbourhoodText: {
      fontSize: 14,
      color: COLORS.text,
      fontWeight: '600',
      marginLeft: 8,
    },
    descriptionText: {
      fontSize: 14,
      color: COLORS.subText,
      lineHeight: 22,
    },

    /* Reviews Section Styling */
    reviewHeaderRow: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 8,
    },
    headerButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'flex-end',
      gap: 8,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginLeft: 8,
      marginBottom: 14,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#B88600',
      marginLeft: 4,
    },
    myReviewsHeaderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: COLORS.primary + '10',
      borderWidth: 1,
      borderColor: COLORS.primary + '30',
    },
    myReviewsHeaderText: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.primary,
      marginLeft: 4,
    },
    writeReviewHeaderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: COLORS.primary + '20',
    },
    writeReviewHeaderText: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.primary,
      marginLeft: 4,
    },
    viewReviewsCard: {
      backgroundColor: COLORS.background,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    viewReviewsContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewReviewsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
    },
    viewReviewsSub: {
      fontSize: 12,
      color: COLORS.subText,
      marginTop: 2,
    },

    /* Fixed Bottom Action Bar */
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.card,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      elevation: 10,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      gap: 12,
    },
    bottomContactBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: COLORS.card,
    },
    bottomContactText: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    scheduleVisitBtn: {
      flex: 1,
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    scheduleVisitText: {
      color: COLORS.white,
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
