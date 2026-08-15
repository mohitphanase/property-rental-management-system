import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as ImagePicker from 'expo-image-picker'

import CustomInput from '../../../components/common/CustomInput'
import PrimaryButton from '../../../components/common/PrimaryButton'
import { ThemeContext } from '../../../provider/ThemeProvider'
import {
  addProperty,
  uploadPropertyImage,
} from '../../../services/propertyService'

const PROPERTY_TYPES = [
  { label: 'Apartment', value: 'APARTMENT', icon: 'apartment' },
  { label: 'House', value: 'HOUSE', icon: 'house' },
  { label: 'Villa', value: 'VILLA', icon: 'villa' },
  { label: 'PG', value: 'PG', icon: 'holiday-village' },
  { label: 'Room', value: 'ROOM', icon: 'meeting-room' },
]

export default function AddPropertyScreen({ navigation }) {
  // Pulling dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [propertyType, setPropertyType] = useState('APARTMENT')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Modal selector state
  const [modalVisible, setModalVisible] = useState(false)

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null,
  })

  const showAlert = (title, message, type, onClose = null) => {
    setAlertConfig({ visible: true, title, message, type, onClose })
  }

  const closeAlert = () => {
    const { onClose } = alertConfig
    setAlertConfig({ ...alertConfig, visible: false })
    if (onClose) onClose()
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      showAlert(
        'Permission Required',
        'Permission to access gallery is required to upload property photos.',
        'warning'
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleAddProperty = async () => {
    if (!title || !address || !city || !price) {
      showAlert(
        'Missing Fields',
        'Please fill in all required fields.',
        'warning'
      )
      return
    }

    const propertyData = {
      title,
      description,
      address,
      city,
      price,
      propertyType,
    }

    setLoading(true)

    try {
      // Save property
      const response = await addProperty(propertyData)
      const propertyId = response.data.data.propertyId

      // Upload image if selected
      if (image) {
        await uploadPropertyImage(propertyId, image)
      }

      setLoading(false)
      showAlert('Success', 'Property added successfully!', 'success', () =>
        navigation.goBack()
      )
    } catch (error) {
      setLoading(false)
      console.log('Add Property Error:', error.response?.data || error)
      showAlert(
        'Failed',
        error.response?.data?.message || 'Unable to add property at this time.',
        'error'
      )
    }
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

  // Find label/icon for currently selected property type value
  const selectedType =
    PROPERTY_TYPES.find(item => item.value === propertyType) ||
    PROPERTY_TYPES[0]

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          COLORS.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={COLORS.background}
      />

      {/* Screen header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={styles.topBarTitle}>List a Property</Text>
          <Text style={styles.topBarSubtitle}>
            Fill in the details below to publish
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Upload Image Section */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={pickImage}
          activeOpacity={0.85}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.image} />
              <View style={styles.imageEditBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
                <Text style={styles.imageEditBadgeText}>Change photo</Text>
              </View>
            </>
          ) : (
            <View style={styles.uploadPlaceholderContent}>
              <View style={styles.uploadIconBadge}>
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.uploadText}>Upload Property Image</Text>
              <Text style={styles.uploadSubText}>
                Tap to select from gallery
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Basic details */}
        <Text style={styles.groupLabel}>Basic Details</Text>
        <View style={styles.formCard}>
          <CustomInput
            placeholder="Property Title"
            value={title}
            onChangeText={setTitle}
          />

          <CustomInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Location */}
        <Text style={styles.groupLabel}>Location</Text>
        <View style={styles.formCard}>
          <CustomInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />

          <CustomInput placeholder="City" value={city} onChangeText={setCity} />
        </View>

        {/* Pricing & type */}
        <Text style={styles.groupLabel}>Pricing & Type</Text>
        <View style={styles.formCard}>
          <CustomInput
            placeholder="Monthly Rent (₹)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Property Type Modal Trigger Box */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Property Type</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}>
              <View style={styles.pickerTriggerLeft}>
                <View style={styles.pickerTriggerIconBadge}>
                  <Icon
                    name={selectedType.icon}
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.pickerTriggerText}>
                  {selectedType.label}
                </Text>
              </View>
              <Icon
                name="keyboard-arrow-down"
                size={24}
                color={COLORS.subText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.loadingButtonText}>Submitting Property...</Text>
          </View>
        ) : (
          <PrimaryButton title="Add Property" onPress={handleAddProperty} />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Property Type Selection Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Property Type</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}>
                <Icon name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={PROPERTY_TYPES}
              keyExtractor={item => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = propertyType === item.value
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && {
                        backgroundColor: COLORS.primary + '12',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPropertyType(item.value)
                      setModalVisible(false)
                    }}>
                    <View style={styles.modalOptionLeft}>
                      <View
                        style={[
                          styles.modalOptionIconBadge,
                          {
                            backgroundColor: isSelected
                              ? COLORS.primary + '20'
                              : COLORS.background,
                          },
                        ]}>
                        <Icon
                          name={item.icon}
                          size={18}
                          color={isSelected ? COLORS.primary : COLORS.subText}
                        />
                      </View>
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSelected && {
                            color: COLORS.primary,
                            fontWeight: '800',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Icon
                        name="check-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                )
              }}
            />
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
                  backgroundColor: getAlertStyle(alertConfig.type).color + '15',
                },
              ]}>
              <Icon
                name={getAlertStyle(alertConfig.type).icon}
                size={40}
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
              <Text style={styles.alertButtonText}>Got it</Text>
            </TouchableOpacity>
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
    content: {
      padding: 20,
      paddingTop: 16,
    },

    /* Top bar */
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'android' ? 14 : 6,
      paddingBottom: 12,
      gap: 14,
      backgroundColor: COLORS.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    topBarTextWrap: {
      flex: 1,
    },
    topBarTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: COLORS.text,
    },
    topBarSubtitle: {
      marginTop: 2,
      fontSize: 12.5,
      fontWeight: '500',
      color: COLORS.subText,
    },

    /* Image Upload Box */
    imageContainer: {
      height: 200,
      backgroundColor: COLORS.card,
      borderRadius: 22,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: COLORS.primary + '55',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 22,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    uploadPlaceholderContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadIconBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: COLORS.primary + '12',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    uploadText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '800',
    },
    uploadSubText: {
      marginTop: 4,
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '500',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageEditBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 14,
    },
    imageEditBadgeText: {
      color: '#FFFFFF',
      fontSize: 12.5,
      fontWeight: '700',
    },

    /* Form grouping */
    groupLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      marginLeft: 4,
    },
    formCard: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 14,
      gap: 12,
      marginBottom: 22,
      elevation: 1,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },

    /* Modal Trigger Styling */
    pickerWrapper: {
      marginTop: 2,
    },
    pickerLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    pickerTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pickerTriggerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    pickerTriggerIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.primary + '12',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerTriggerText: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
    },

    /* Selection Modal Styling */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,15,20,0.55)',
      justifyContent: 'flex-end', // Pops up from the bottom like a sheet
    },
    modalContent: {
      backgroundColor: COLORS.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingBottom: 24,
      paddingTop: 10,
      maxHeight: '55%',
      elevation: 10,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    },
    modalGrabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.border,
      marginBottom: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingBottom: 14,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 6,
    },
    modalOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalOptionIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOptionText: {
      fontSize: 15.5,
      fontWeight: '600',
      color: COLORS.text,
    },

    /* Loading state wrapper for button */
    loadingBox: {
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    loadingButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '800',
    },

    /* Custom Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,15,20,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertBox: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: COLORS.card,
      borderRadius: 30,
      padding: 26,
      alignItems: 'center',
      elevation: 12,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    alertIconContainer: {
      width: 76,
      height: 76,
      borderRadius: 38,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 14.5,
      color: COLORS.subText,
      textAlign: 'center',
      marginBottom: 26,
      lineHeight: 21,
    },
    alertButton: {
      width: '100%',
      paddingVertical: 15,
      borderRadius: 16,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  })
