import React, { useState, useContext, useCallback } from "react"
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"

import { ThemeContext } from "../../provider/ThemeProvider"
import PrimaryButton from "../../components/common/PrimaryButton"
import {
  getMyReviews,
  deleteReview,
  addPropertyReview,
} from "../../services/reviewService"

export default function MyReviewsScreen({ navigation, route }) {
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State - Default rating set to 0 for unfilled stars
  const [propertyId, setPropertyId] = useState("")
  const [propertyTitle, setPropertyTitle] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  })

  const showAlert = (title, message, type = "info", onConfirm = null) => {
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
    }, [route?.params]),
  )

  const loadMyReviews = async () => {
    try {
      const response = await getMyReviews()
      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || []
      setReviews(data)
    } catch (error) {
      console.log("Error loading my reviews:", error?.response?.data || error)
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
        "Required",
        "Please select or enter a valid Property ID.",
        "warning",
      )
      return
    }

    if (rating === 0) {
      showAlert(
        "Required",
        "Please select a star rating before submitting.",
        "warning",
      )
      return
    }

    if (!comment.trim()) {
      showAlert(
        "Required",
        "Please write a brief comment before submitting.",
        "warning",
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

      setComment("")
      setRating(0) // Reset back to unselected state
      showAlert(
        "Success",
        "Your review has been published successfully!",
        "success",
      )
      loadMyReviews()
    } catch (error) {
      console.log("Review Submit Error:", error?.response?.data || error)
      showAlert(
        "Failed",
        error.response?.data?.message || "Unable to submit review right now.",
        "error",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = (reviewId) => {
    if (!reviewId) return
    showAlert(
      "Delete Review",
      "Are you sure you want to delete this review? This action cannot be undone.",
      "confirm",
      () => executeDeleteReview(reviewId),
    )
  }

  const executeDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      closeAlert()
      setTimeout(() => {
        showAlert("Success", "Review deleted successfully.", "success")
        loadMyReviews()
      }, 300)
    } catch (error) {
      closeAlert()
      setTimeout(() => {
        showAlert(
          "Error",
          error.response?.data?.message || "Failed to delete review.",
          "error",
        )
      }, 300)
    }
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case "success":
        return { icon: "check-circle", color: COLORS.success }
      case "error":
        return { icon: "error", color: COLORS.error }
      case "confirm":
      case "warning":
        return { icon: "warning", color: COLORS.warning }
      default:
        return { icon: "info", color: COLORS.primary }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          COLORS.background === "#FFFFFF" ? "dark-content" : "light-content"
        }
        backgroundColor={COLORS.background}
      />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
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
              <Text style={styles.sectionTitle}>Add a Review</Text>
              {propertyTitle ? (
                <Text style={styles.propertySubtitle}>
                  Property: {propertyTitle}
                </Text>
              ) : null}

              {/* Target Property ID Box */}
              <View style={styles.idBox}>
                <Text style={styles.idLabel}>Target Property ID:</Text>
                <Text style={styles.idValue}>
                  {propertyId || "Not Selected"}
                </Text>
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
              <Text style={styles.inputLabel}>Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                  >
                    <Icon
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color={star <= rating ? "#FFB800" : COLORS.subText}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {item?.property?.title ||
                      item?.propertyTitle ||
                      `Property #${item?.property?.propertyId || item?.property_Id || ""}`}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {item?.createAt
                      ? new Date(item.createAt).toLocaleDateString()
                      : item?.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Posted recently"}
                  </Text>
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>{item?.rating || 5}</Text>
                </View>
              </View>

              {/* Review Comment */}
              <Text style={styles.commentText}>{item?.comment}</Text>

              {/* Delete Action Button */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteRequest(item?.reviewId)}
                >
                  <Icon name="delete-outline" size={18} color={COLORS.error} />
                  <Text style={styles.deleteBtnText}>Delete Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Icon name="rate-review" size={42} color={COLORS.subText} />
              <Text style={styles.emptyTitle}>No Reviews Posted Yet</Text>
              <Text style={styles.emptySub}>
                Your submitted property reviews will be displayed here.
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
                  backgroundColor: getAlertStyle(alertConfig.type).color + "15",
                },
              ]}
            >
              <Icon
                name={getAlertStyle(alertConfig.type).icon}
                size={38}
                color={getAlertStyle(alertConfig.type).color}
              />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            {alertConfig.type === "confirm" ? (
              <View style={styles.alertButtonRow}>
                <TouchableOpacity
                  style={styles.alertCancelBtn}
                  activeOpacity={0.7}
                  onPress={closeAlert}
                >
                  <Text style={styles.alertCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.alertConfirmBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    closeAlert()
                    if (alertConfig.onConfirm) alertConfig.onConfirm()
                  }}
                >
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
                onPress={closeAlert}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const getStyles = (COLORS) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    loaderContainer: {
      flex: 1,
      justify: "center",
      alignItems: "center",
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 12,
      paddingTop: Platform.OS === "android" ? 8 : 8,
      backgroundColor: COLORS.background,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    backIcon: {
      marginLeft: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.text,
      flex: 1,
      textAlign: "center",
      marginHorizontal: 10,
    },
    headerSpacer: {
      width: 40,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },

    /* Form Card */
    formCard: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.text,
    },
    propertySubtitle: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.primary,
      marginTop: 2,
      marginBottom: 10,
    },
    idBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.background,
      padding: 10,
      borderRadius: 10,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    idLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.subText,
    },
    idValue: {
      fontSize: 13,
      fontWeight: "800",
      color: COLORS.primary,
      marginLeft: 6,
    },
    singleInput: {
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 8,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.text,
      marginTop: 6,
      marginBottom: 6,
    },
    starsContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginVertical: 4,
    },
    starIcon: {
      marginRight: 6,
    },
    input: {
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 16,
      minHeight: 80,
    },
    submittingBox: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    submittingText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    /* Review Item Card */
    reviewCard: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    propertyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: COLORS.text,
    },
    reviewDate: {
      fontSize: 12,
      color: COLORS.subText,
      marginTop: 2,
      fontWeight: "500",
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF8E7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: "800",
      color: "#B88600",
    },
    commentText: {
      fontSize: 14,
      color: COLORS.text,
      lineHeight: 20,
      marginVertical: 6,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: COLORS.border + "50",
    },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    deleteBtnText: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.error,
    },

    /* Empty State */
    emptyCard: {
      alignItems: "center",
      justifyContent: "center",
      padding: 36,
      backgroundColor: COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: "dashed",
      marginTop: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.text,
      marginTop: 12,
    },
    emptySub: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
    },

    /* Custom Alert Modal Styling */
    alertOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    alertBox: {
      width: "100%",
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      elevation: 10,
    },
    alertIconContainer: {
      width: 68,
      height: 68,
      borderRadius: 34,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: COLORS.text,
      marginBottom: 8,
      textAlign: "center",
    },
    alertMessage: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 20,
    },
    alertButton: {
      width: "100%",
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
    },
    alertButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },
    alertButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: 12,
    },
    alertCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: "center",
    },
    alertCancelBtnText: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: "700",
    },
    alertConfirmBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: COLORS.error,
      alignItems: "center",
    },
    alertConfirmBtnText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
  })
