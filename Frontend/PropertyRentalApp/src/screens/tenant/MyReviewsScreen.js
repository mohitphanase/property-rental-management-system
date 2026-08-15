import React, { useState, useContext, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ThemeContext } from '../../provider/ThemeProvider'
import PrimaryButton from '../../components/common/PrimaryButton'
import {
  getMyReviews,
  deleteReview,
  addPropertyReview,
} from '../../services/reviewService'

export default function MyReviewsScreen({ navigation, route }) {
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State - Default rating set to 0 for unfilled stars
  const [propertyId, setPropertyId] = useState('')
  const [propertyTitle, setPropertyTitle] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  })

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  // Safely extract property parameters whenever screen receives focus
  useFocusEffect(
    useCallback(() => {
      const paramId =
        route?.params?.propertyId || route?.params?.property?.propertyId
      const paramTitle =
        route?.params?.propertyTitle || route?.params?.property?.title

      if (paramId) {
        setPropertyId(String(paramId))
      }
      if (paramTitle) {
        setPropertyTitle(String(paramTitle))
      }

      loadMyReviews()
    }, [route?.params])
  )

  const loadMyReviews = async () => {
    try {
      const response = await getMyReviews()
      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || []
      setReviews(data)
    } catch (error) {
      console.log('Error loading my reviews:', error?.response?.data || error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadMyReviews()
  }

  const handleSubmitReview = async () => {
    if (!propertyId || !propertyId.trim()) {
      showAlert(
        'Required',
        'Please select or enter a valid Property ID.',
        'warning'
      )
      return
    }

    if (rating === 0) {
      showAlert(
        'Required',
        'Please select a star rating before submitting.',
        'warning'
      )
      return
    }

    if (!comment.trim()) {
      showAlert(
        'Required',
        'Please write a brief comment before submitting.',
        'warning'
      )
      return
    }

    setSubmitting(true)
    try {
      await addPropertyReview({
        propertyId: Number(propertyId),
        rating: Number(rating),
        comment: comment.trim(),
      })

      setComment('')
      setRating(0) // Reset back to unselected state
      showAlert(
        'Success',
        'Your review has been published successfully!',
        'success'
      )
      loadMyReviews()
    } catch (error) {
      console.log('Review Submit Error:', error?.response?.data || error)
      showAlert(
        'Failed',
        error.response?.data?.message || 'Unable to submit review right now.',
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = reviewId => {
    if (!reviewId) return
    showAlert(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      'confirm',
      () => executeDeleteReview(reviewId)
    )
  }

  const executeDeleteReview = async reviewId => {
    try {
      await deleteReview(reviewId)
      closeAlert()
      setTimeout(() => {
        showAlert('Success', 'Review deleted successfully.', 'success')
        loadMyReviews()
      }, 300)
    } catch (error) {
      closeAlert()
      setTimeout(() => {
        showAlert(
          'Error',
          error.response?.data?.message || 'Failed to delete review.',
          'error'
        )
      }, 300)
    }
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      case 'confirm':
      case 'warning':
        return { icon: 'warning', color: COLORS.warning }
      default:
        return { icon: 'info', color: COLORS.primary }
    }
  }

  const getInitial = title => (title || 'P').trim().charAt(0).toUpperCase()

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={
          COLORS.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={COLORS.background}
      />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back-ios"
            size={18}
            color={COLORS.text}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) =>
            item?.reviewId?.toString() || index.toString()
          }
          ListHeaderComponent={
            <View style={styles.formCard}>
              <View style={styles.formHeaderRow}>
                <View style={styles.formIconBubble}>
                  <Icon name="rate-review" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Add a Review</Text>
                  {propertyTitle ? (
                    <Text style={styles.propertySubtitle} numberOfLines={1}>
                      {propertyTitle}
                    </Text>
                  ) : (
                    <Text style={styles.propertySubtitlePlaceholder}>
                      Share your experience
                    </Text>
                  )}
                </View>
              </View>

              {/* Target Property ID Box */}
              <View style={styles.idBox}>
                <Icon name="home-work" size={16} color={COLORS.primary} />
                <Text style={styles.idLabel}>Property ID</Text>
                <View style={styles.idValuePill}>
                  <Text style={styles.idValue}>
                    {propertyId || 'Not selected'}
                  </Text>
                </View>
              </View>

              {/* Manual Input Fallback */}
              {!propertyId ? (
                <TextInput
                  style={styles.singleInput}
                  placeholder="Enter Property ID (e.g. 1)"
                  placeholderTextColor={COLORS.subText}
                  value={propertyId}
                  onChangeText={setPropertyId}
                  keyboardType="number-pad"
                />
              ) : null}

              {/* Star Rating Selection */}
              <Text style={styles.inputLabel}>Your Rating</Text>
              <View style={styles.starsCard}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.6}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                      onPress={() => setRating(star)}>
                      <Icon
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={34}
                        color={star <= rating ? '#FFB800' : COLORS.subText}
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.ratingHint}>
                  {rating === 0
                    ? 'Tap to rate'
                    : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][
                        rating
                      ]}
                </Text>
              </View>

              {/* Comment Input */}
              <Text style={styles.inputLabel}>Your Feedback</Text>
              <TextInput
                style={styles.input}
                placeholder="Share details about your stay or experience..."
                placeholderTextColor={COLORS.subText}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
              />

              {submitting ? (
                <View style={styles.submittingBox}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submittingText}>
                    Submitting Review...
                  </Text>
                </View>
              ) : (
                <PrimaryButton
                  title="Submit Review"
                  onPress={handleSubmitReview}
                />
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListFooterComponentStyle={{ paddingTop: 4 }}
          ListHeaderComponentStyle={{ marginBottom: 4 }}
          renderItem={({ item }) => {
            const title =
              item?.property?.title ||
              item?.propertyTitle ||
              `Property #${item?.property?.propertyId || item?.property_Id || ''}`

            return (
              <View style={styles.reviewCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBubble}>
                    <Text style={styles.avatarText}>{getInitial(title)}</Text>
                  </View>

                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={styles.propertyTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <View style={styles.dateRow}>
                      <Icon name="schedule" size={12} color={COLORS.subText} />
                      <Text style={styles.reviewDate}>
                        {item?.createAt
                          ? new Date(item.createAt).toLocaleDateString()
                          : item?.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : 'Posted recently'}
                      </Text>
                    </View>
                  </View>

                  {/* Rating Badge */}
                  <View style={styles.ratingBadge}>
                    <Icon name="star" size={13} color="#FFB800" />
                    <Text style={styles.ratingText}>{item?.rating || 5}</Text>
                  </View>
                </View>

                {/* Review Comment */}
                <Text style={styles.commentText}>{item?.comment}</Text>

                {/* Delete Action Button */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.6}
                    onPress={() => handleDeleteRequest(item?.reviewId)}>
                    <Icon
                      name="delete-outline"
                      size={17}
                      color={COLORS.error}
                    />
                    <Text style={styles.deleteBtnText}>Delete Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBubble}>
                <Icon name="rate-review" size={38} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Reviews Posted Yet</Text>
              <Text style={styles.emptySub}>
                Your submitted property reviews will appear here once you
                publish one above.
              </Text>
            </View>
          }
        />
      )}

      {/* Custom Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor: getAlertStyle(alertConfig.type).color + '18',
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
                activeOpacity={0.85}
                onPress={closeAlert}>
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const shadow = (elevation = 3) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: 0.08,
  shadowRadius: elevation,
  elevation,
})

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 14,
      paddingTop: 8,
      backgroundColor: COLORS.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
      ...shadow(2),
    },
    backIcon: {
      marginLeft: 6,
    },
    headerTitle: {
      fontSize: 19,
      fontWeight: '800',
      letterSpacing: 0.2,
      color: COLORS.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 10,
    },
    headerSpacer: {
      width: 40,
    },
    listContent: {
      padding: 16,
      paddingBottom: 48,
    },

    /* Form Card */
    formCard: {
      backgroundColor: COLORS.card,
      borderRadius: 22,
      padding: 20,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: COLORS.border,
      ...shadow(4),
    },
    formHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    formIconBubble: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: COLORS.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text,
    },
    propertySubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.primary,
      marginTop: 2,
    },
    propertySubtitlePlaceholder: {
      fontSize: 13,
      fontWeight: '500',
      color: COLORS.subText,
      marginTop: 2,
    },
    idBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: 8,
    },
    idLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.subText,
      flex: 1,
    },
    idValuePill: {
      backgroundColor: COLORS.primary + '18',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    idValue: {
      fontSize: 13,
      fontWeight: '800',
      color: COLORS.primary,
    },
    singleInput: {
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 10,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: 4,
      marginBottom: 8,
    },
    starsCard: {
      backgroundColor: COLORS.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginBottom: 4,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    starIcon: {
      marginHorizontal: 4,
    },
    ratingHint: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.subText,
      letterSpacing: 0.3,
    },
    input: {
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 14,
      padding: 14,
      fontSize: 14,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: COLORS.border,
      marginTop: 14,
      marginBottom: 18,
      minHeight: 88,
    },
    submittingBox: {
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      paddingVertical: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    submittingText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },

    /* Review Item Card */
    reviewCard: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      ...shadow(3),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarBubble: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: COLORS.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.primary,
    },
    propertyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: COLORS.text,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 3,
    },
    reviewDate: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '500',
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E7',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      gap: 4,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#B88600',
    },
    commentText: {
      fontSize: 14,
      color: COLORS.text,
      lineHeight: 21,
      marginBottom: 4,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: COLORS.border + '60',
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: COLORS.error + '12',
    },
    deleteBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.error,
    },

    /* Empty State */
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      backgroundColor: COLORS.card,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginTop: 8,
    },
    emptyIconBubble: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: COLORS.primary + '14',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginTop: 10,
    },
    emptySub: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 20,
      maxWidth: 260,
    },

    /* Custom Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertBox: {
      width: '100%',
      backgroundColor: COLORS.card,
      borderRadius: 26,
      padding: 26,
      alignItems: 'center',
      ...shadow(10),
    },
    alertIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    alertMessage: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
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
    },
    alertButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    alertCancelBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 16,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
    },
    alertCancelBtnText: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: '700',
    },
    alertConfirmBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 16,
      backgroundColor: COLORS.error,
      alignItems: 'center',
    },
    alertConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  })
