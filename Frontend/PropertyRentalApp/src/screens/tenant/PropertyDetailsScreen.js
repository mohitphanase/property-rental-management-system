import React, { useState } from 'react'
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
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import COLORS from '../../theme/colors'
import { SERVER_URL } from '../../utils/config'

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property } = route.params

  const imageUrl =
    property.images?.length > 0
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
    if (!property.ownerPhone) {
      showAlert(
        'Not Available',
        'The owner has not provided a contact number for this property.',
        'warning'
      )
      return
    }
    Linking.openURL(`tel:${property.ownerPhone}`)
  }

  // Helper for alert styles
  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success || '#28A745' }
      case 'error':
        return { icon: 'error', color: COLORS.error || '#DC3545' }
      default:
        return { icon: 'phone-disabled', color: COLORS.warning || '#F5A623' }
    }
  }

  return (
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back-ios"
              size={20}
              color="#000"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>
              ₹{property.price}
              <Text style={styles.priceSubText}>/mo</Text>
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              <Icon name="star" size={18} color="#FFC107" />
              <Icon name="star" size={18} color="#FFC107" />
              <Icon name="star" size={18} color="#FFC107" />
              <Icon name="star" size={18} color="#FFC107" />
              <Icon name="star-half" size={18} color="#FFC107" />
            </View>
            <Text style={styles.ratingText}>
              4.8 <Text style={styles.reviewCount}>(245 Reviews)</Text>
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Icon
                  name="location-on"
                  size={24}
                  color={COLORS.primary || '#007BFF'}
                />
              </View>
              <View>
                <Text style={styles.featureLabel}>Location</Text>
                <Text style={styles.featureValue} numberOfLines={1}>
                  {property.city}
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Icon
                  name="home"
                  size={24}
                  color={COLORS.primary || '#007BFF'}
                />
              </View>
              <View>
                <Text style={styles.featureLabel}>Type</Text>
                <Text style={styles.featureValue} numberOfLines={1}>
                  {property.propertyType}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.contactIconBtn}
          activeOpacity={0.7}
          onPress={contactOwner}>
          <Icon
            name="phone-in-talk"
            size={24}
            color={COLORS.primary || '#007BFF'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BookingForm', { property })}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Icon name="arrow-forward" size={20} color="#FFF" />
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
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the fixed bottom bar
  },

  /* Image & Header Section */
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.placeholder || '#E9ECEF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 40, // Moved slightly more down
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  priceBadge: {
    position: 'absolute',
    bottom: -20,
    right: 25,
    backgroundColor: COLORS.primary || '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 6,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  priceSubText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },

  /* Content Section */
  contentContainer: {
    padding: 25,
    paddingTop: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 10,
    lineHeight: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text || '#343A40',
  },
  reviewCount: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.subText || '#6C757D',
  },

  /* Features Grid */
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card || '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: (COLORS.primary || '#007BFF') + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureLabel: {
    fontSize: 12,
    color: COLORS.subText || '#6C757D',
    fontWeight: '600',
    marginBottom: 2,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text || '#212529',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border || '#F1F3F5',
    marginVertical: 20,
  },

  /* Description */
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text || '#212529',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.subText || '#495057',
    lineHeight: 24,
  },

  /* Fixed Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#F1F3F5',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  contactIconBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary || '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#FFFFFF',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary || '#007BFF',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary || '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
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
