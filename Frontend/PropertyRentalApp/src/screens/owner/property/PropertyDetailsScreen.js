import React, { useEffect, useState, useCallback, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ThemeContext } from '../../../provider/ThemeProvider'
import { SERVER_URL } from '../../../utils/config'
import PrimaryButton from '../../../components/common/PrimaryButton'
import {
  getPropertyById,
  deleteProperty,
} from '../../../services/propertyService'

export default function PropertyDetailsScreen({ route, navigation }) {
  const { propertyId } = route.params

  // Pulling dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'confirm'
    onConfirm: null,
  })

  const showAlert = (title, message, type, onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  useFocusEffect(
    useCallback(() => {
      loadProperty()
    }, [propertyId])
  )

  const loadProperty = async () => {
    try {
      const response = await getPropertyById(propertyId)
      setProperty(response.data.data)
    } catch (error) {
      console.log('Error loading property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePropertyRequest = () => {
    showAlert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      'confirm',
      () => executeDeleteProperty()
    )
  }

  const executeDeleteProperty = async () => {
    try {
      await deleteProperty(property.propertyId)
      closeAlert()
      setTimeout(() => {
        showAlert('Success', 'Property deleted successfully.', 'success', () =>
          navigation.goBack()
        )
      }, 400)
    } catch (error) {
      closeAlert()
      setTimeout(() => {
        showAlert(
          'Error',
          error.response?.data?.message || 'Failed to delete property.',
          'error'
        )
      }, 400)
    }
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      case 'confirm':
        return { icon: 'warning', color: COLORS.warning }
      default:
        return { icon: 'info', color: COLORS.primary }
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.value}>Property details not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          COLORS.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={COLORS.background}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              property.imageUrl
                ? { uri: `${SERVER_URL}/${property.imageUrl}` }
                : require('../../../../assets/property_placeholder.jpg')
            }
            style={styles.image}
          />
        </View>

        {/* Content Card */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {property.propertyType || 'APARTMENT'}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icon name="location-on" size={18} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {property.address ? `${property.address}, ` : ''}
              {property.city}
            </Text>
          </View>

          {/* Price Box */}
          <View style={styles.priceBox}>
            <Text style={styles.label}>Monthly Rent</Text>
            <Text style={styles.price}>
              ₹{property.price} <Text style={styles.pricePerMo}>/month</Text>
            </Text>
          </View>

          {/* Description Box */}
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {property.description ||
                'No description available for this property.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('EditProperty', {
                  property: property,
                })
              }>
              <Icon name="edit" size={20} color={COLORS.white} />
              <Text style={styles.editButtonText}>Edit Property</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.8}
              onPress={handleDeletePropertyRequest}>
              <Icon name="delete-outline" size={20} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Delete Property</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

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

            {alertConfig.type === 'confirm' ? (
              <View style={styles.alertButtonRow}>
                <TouchableOpacity
                  style={styles.alertCancelBtn}
                  activeOpacity={0.7}
                  onPress={closeAlert}>
                  <Text style={styles.alertCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.alertConfirmBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    closeAlert()
                    if (alertConfig.onConfirm) alertConfig.onConfirm()
                  }}>
                  <Text style={styles.alertConfirmBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.alertButton,
                  { backgroundColor: getAlertStyle(alertConfig.type).color },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  closeAlert()
                  if (alertConfig.onClose) alertConfig.onClose()
                }}>
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },

    /* Image Container */
    imageContainer: {
      width: '100%',
      height: 260,
      backgroundColor: COLORS.card,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    /* Content Layout */
    content: {
      padding: 20,
      backgroundColor: COLORS.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -20,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
      gap: 10,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.text,
      flex: 1,
    },
    typeBadge: {
      backgroundColor: COLORS.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.primary + '30',
    },
    typeBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: COLORS.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    locationText: {
      fontSize: 14,
      color: COLORS.subText,
      marginLeft: 4,
      fontWeight: '500',
      flex: 1,
    },

    /* Price Box */
    priceBox: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    label: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    price: {
      fontSize: 24,
      fontWeight: '800',
      color: COLORS.primary,
    },
    pricePerMo: {
      fontSize: 14,
      color: COLORS.subText,
      fontWeight: '600',
    },

    /* Description Section */
    sectionBox: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 15,
      color: COLORS.subText,
      lineHeight: 22,
      fontWeight: '500',
    },
    value: {
      fontSize: 16,
      color: COLORS.text,
      fontWeight: '600',
    },

    /* Action Buttons */
    actionsContainer: {
      gap: 12,
    },
    editButton: {
      flexDirection: 'row',
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    editButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '800',
    },
    deleteButton: {
      flexDirection: 'row',
      backgroundColor: COLORS.background,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: COLORS.error + '50',
    },
    deleteButtonText: {
      color: COLORS.error,
      fontSize: 16,
      fontWeight: '800',
    },

    /* Custom Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: 28,
      padding: 24,
      alignItems: 'center',
      elevation: 10,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    alertIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    alertTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 15,
      color: COLORS.subText,
      textAlign: 'center',
      marginBottom: 28,
      lineHeight: 22,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    alertButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    alertCancelBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
    },
    alertCancelBtnText: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: '700',
    },
    alertConfirmBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.error,
      alignItems: 'center',
      elevation: 3,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    alertConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
  })
