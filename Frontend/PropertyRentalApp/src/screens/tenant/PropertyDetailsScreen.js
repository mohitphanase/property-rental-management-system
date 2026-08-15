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

  const imageUrl =
    property?.images && property.images.length > 0
      ? `${SERVER_URL}/${property.images[0].imageUrl}`
      : null

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
        message: `Check out this property: ${property?.title || 'Property'} in ${
          property?.city || 'City'
        } for ₹${property?.price || 0}/mo`,
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
        return { icon: 'check-circle', color: COLORS.success || '#10B981' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#EF4444' }
      case 'info':
        return { icon: 'info', color: COLORS.primary || '#3B82F6' }
      default:
        return { icon: 'warning', color: COLORS.warning || '#F59E0B' }
    }
  }

  if (!property?.propertyId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fallbackContainer}>
          <TouchableOpacity
            style={styles.backButtonFallback}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.fallbackIconCircle}>
            <Icon name="info-outline" size={48} color={COLORS.subText} />
          </View>
          <Text style={styles.fallbackTitle}>No Details Found</Text>
          <Text style={styles.fallbackText}>
            We couldn't retrieve the property details. Please try again later.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header Visual Section */}
          <View style={styles.imageContainer}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require('../../../assets/property_placeholder.png')
              }
              style={styles.image}
            />
            <View style={styles.imageScrim} />

            {/* Floating Top Navigation */}
            <View style={styles.topActionRow}>
              <TouchableOpacity
                style={styles.circleIconButton}
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={20} color="#1F2937" />
              </TouchableOpacity>

              <View style={styles.topRightIcons}>
                <TouchableOpacity
                  style={styles.circleIconButton}
                  activeOpacity={0.8}
                  onPress={handleShare}>
                  <Icon name="share" size={20} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.circleIconButton, { marginLeft: 10 }]}
                  activeOpacity={0.8}
                  onPress={handleWishlist}>
                  <Icon
                    name={isWishlisted ? 'favorite' : 'favorite-border'}
                    size={22}
                    color={isWishlisted ? COLORS.error || '#EF4444' : '#1F2937'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {property.propertyType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {property.propertyType}
                </Text>
              </View>
            )}
          </View>

          {/* Floating Main Information Header */}
          <View style={styles.titlePriceCard}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.title} numberOfLines={2}>
                {property.title}
              </Text>
              <View style={styles.locationRow}>
                <Icon name="location-on" size={16} color={COLORS.primary} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {property.city} • {property.description || 'Prime Location'}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                ₹{Number(property.price || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.priceSubText}>/ month</Text>
            </View>
          </View>

          {/* Key Attributes Overview Grid */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Property Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <View style={styles.overviewIconCircle}>
                  <Icon name="domain" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewLabel}>Category</Text>
                  <Text style={styles.overviewValue} numberOfLines={1}>
                    {property.propertyType || 'Standard'}
                  </Text>
                </View>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIconCircle}>
                  <Icon name="place" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewLabel}>Location</Text>
                  <Text style={styles.overviewValue} numberOfLines={1}>
                    {property.city || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIconCircle}>
                  <Icon
                    name="person-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewLabel}>Lister</Text>
                  <Text style={styles.overviewValue} numberOfLines={1}>
                    {property.ownerName || 'Verified Host'}
                  </Text>
                </View>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIconCircle}>
                  <Icon name="phone-in-talk" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.overviewTextContainer}>
                  <Text style={styles.overviewLabel}>Contact</Text>
                  <Text style={styles.overviewValue} numberOfLines={1}>
                    {property.ownerPhone ? 'Available' : 'On Request'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>About this space</Text>
            <Text style={styles.descriptionText}>
              {property.description?.trim()
                ? property.description
                : 'No additional details have been provided by the landlord for this listing.'}
            </Text>
          </View>

          {/* Community Feedback & Reviews Header */}
          <View style={styles.sectionCard}>
            <View style={styles.reviewHeaderRow}>
              <View style={styles.ratingTitleContainer}>
                <Text style={styles.sectionHeaderTitle}>Tenant Reviews</Text>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>

              <View style={styles.headerButtonsRow}>
                <TouchableOpacity
                  style={styles.actionPillBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('MyReviews', {
                      propertyId: property.propertyId,
                      propertyTitle: property.title,
                    })
                  }>
                  <Text style={styles.actionPillText}>My Feedback</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionPillBtn, styles.actionPillPrimary]}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ReviewScreen', {
                      propertyId: property.propertyId,
                      propertyTitle: property.title,
                    })
                  }>
                  <Icon name="rate-review" size={14} color={COLORS.primary} />
                  <Text style={styles.actionPillPrimaryText}>All Reviews</Text>
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
                <View style={styles.viewReviewsIconCircle}>
                  <Icon name="rate-review" size={20} color={COLORS.primary} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.viewReviewsTitle}>Read All Reviews</Text>
                  <Text style={styles.viewReviewsSub}>
                    See ratings, feedback, and experiences from prior residents
                  </Text>
                </View>
                <Icon
                  name="arrow-forward-ios"
                  size={14}
                  color={COLORS.subText}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Floating Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomContactBtn}
            activeOpacity={0.85}
            onPress={contactOwner}>
            <Icon
              name="call"
              size={18}
              color={COLORS.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.bottomContactText}>Call Owner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scheduleVisitBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('BookingForm', { property })}>
            <Icon
              name="event-available"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.scheduleVisitText}>Book Visit</Text>
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
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    mainContainer: {
      flex: 1,
      backgroundColor: COLORS.background || '#F9FAFB',
    },
    fallbackContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    backButtonFallback: {
      position: 'absolute',
      top: 20,
      left: 20,
      padding: 8,
    },
    fallbackIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.card || '#FFFFFF',
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    fallbackTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 6,
    },
    fallbackText: {
      fontSize: 14,
      color: COLORS.subText || '#6B7280',
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 110,
    },

    /* Header Visual Section */
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 340,
      backgroundColor: '#E5E7EB',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    typeBadge: {
      position: 'absolute',
      bottom: 44,
      left: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.text || '#1F2937',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    topActionRow: {
      position: 'absolute',
      top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
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
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },

    /* Floating Card */
    titlePriceCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: COLORS.card || '#FFFFFF',
      padding: 20,
      marginHorizontal: 16,
      marginTop: -28,
      borderRadius: 20,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border || 'rgba(229, 231, 235, 0.8)',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 6,
      lineHeight: 26,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      fontSize: 13,
      color: COLORS.subText || '#6B7280',
      marginLeft: 4,
      flexShrink: 1,
      fontWeight: '500',
    },
    priceContainer: {
      alignItems: 'flex-end',
    },
    priceText: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.primary || '#2563EB',
    },
    priceSubText: {
      fontSize: 12,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },

    /* Card Layout System */
    sectionCard: {
      backgroundColor: COLORS.card || '#FFFFFF',
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.border || '#F3F4F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    sectionHeaderTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text || '#111827',
      marginBottom: 16,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    overviewItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#F9FAFB',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
    },
    overviewIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: (COLORS.primary || '#2563EB') + '12',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overviewTextContainer: {
      marginLeft: 10,
      flex: 1,
    },
    overviewLabel: {
      fontSize: 11,
      color: COLORS.subText || '#6B7280',
      fontWeight: '500',
    },
    overviewValue: {
      fontSize: 13,
      color: COLORS.text || '#1F2937',
      fontWeight: '600',
      marginTop: 2,
    },
    descriptionText: {
      fontSize: 14,
      color: COLORS.subText || '#4B5563',
      lineHeight: 22,
      fontWeight: '400',
    },

    /* Reviews Styling */
    reviewHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    ratingTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      marginLeft: 8,
      marginBottom: 14,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#D97706',
      marginLeft: 3,
    },
    headerButtonsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    actionPillBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: COLORS.background || '#F3F4F6',
    },
    actionPillText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.subText || '#4B5563',
    },
    actionPillPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: (COLORS.primary || '#2563EB') + '14',
      gap: 4,
    },
    actionPillPrimaryText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.primary || '#2563EB',
    },
    viewReviewsCard: {
      backgroundColor: COLORS.background || '#F9FAFB',
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: COLORS.border || '#E5E7EB',
    },
    viewReviewsContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewReviewsIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: (COLORS.primary || '#2563EB') + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewReviewsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text || '#111827',
    },
    viewReviewsSub: {
      fontSize: 12,
      color: COLORS.subText || '#6B7280',
      marginTop: 2,
    },

    /* Fixed Bottom Action Bar */
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.card || '#FFFFFF',
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: Platform.OS === 'ios' ? 28 : 14,
      borderTopWidth: 1,
      borderTopColor: COLORS.border || '#E5E7EB',
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      gap: 12,
    },
    bottomContactBtn: {
      flex: 1,
      flexDirection: 'row',
      borderWidth: 1.5,
      borderColor: COLORS.primary || '#2563EB',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: (COLORS.primary || '#2563EB') + '08',
    },
    bottomContactText: {
      color: COLORS.primary || '#2563EB',
      fontSize: 15,
      fontWeight: '700',
    },
    scheduleVisitBtn: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: COLORS.primary || '#2563EB',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: COLORS.primary || '#2563EB',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
    },
    scheduleVisitText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },

    /* Alert Modal */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
