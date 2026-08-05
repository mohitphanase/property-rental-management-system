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
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'House', value: 'HOUSE' },
  { label: 'Villa', value: 'VILLA' },
  { label: 'PG', value: 'PG' },
  { label: 'Room', value: 'ROOM' },
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

  // Find label for currently selected property type value
  const selectedTypeLabel =
    PROPERTY_TYPES.find(item => item.value === propertyType)?.label ||
    'Select Type'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          COLORS.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={COLORS.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Upload Image Section */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={pickImage}
          activeOpacity={0.8}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.uploadPlaceholderContent}>
              <Ionicons
                name="camera-outline"
                size={45}
                color={COLORS.primary}
              />
              <Text style={styles.uploadText}>Upload Property Image</Text>
              <Text style={styles.uploadSubText}>
                Tap to select from gallery
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Inputs */}
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

        <CustomInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

        <CustomInput placeholder="City" value={city} onChangeText={setCity} />

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
            <Text style={styles.pickerTriggerText}>{selectedTypeLabel}</Text>
            <Icon name="keyboard-arrow-down" size={24} color={COLORS.subText} />
          </TouchableOpacity>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Property Type</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={PROPERTY_TYPES}
              keyExtractor={item => item.value}
              renderItem={({ item }) => {
                const isSelected = propertyType === item.value
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && { backgroundColor: COLORS.primary + '15' },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPropertyType(item.value)
                      setModalVisible(false)
                    }}>
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
                    {isSelected && (
                      <Icon name="check" size={20} color={COLORS.primary} />
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
      paddingTop: 10,
    },

    /* Image Upload Box */
    imageContainer: {
      height: 200,
      backgroundColor: COLORS.card,
      borderRadius: 20,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    uploadPlaceholderContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadText: {
      marginTop: 10,
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
      borderRadius: 18,
      resizeMode: 'cover',
    },

    /* Modal Trigger Styling */
    pickerWrapper: {
      marginBottom: 20,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    pickerTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 16,
      paddingVertical: 16,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    pickerTriggerText: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
    },

    /* Selection Modal Styling */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end', // Pops up from the bottom like a sheet
    },
    modalContent: {
      backgroundColor: COLORS.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      maxHeight: '50%',
      elevation: 10,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
    },
    modalOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    modalOptionText: {
      fontSize: 16,
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
  })
