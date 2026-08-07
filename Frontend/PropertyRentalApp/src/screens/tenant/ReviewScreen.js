import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ThemeContext } from '../../provider/ThemeProvider'
import { getPropertyReviews } from '../../services/reviewService'

export default function ReviewScreen({ route, navigation }) {
  const { propertyId, propertyTitle } = route.params || {}

  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type })
  }

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false })
  }

  useEffect(() => {
    loadReviews()
  }, [propertyId])

  const loadReviews = async () => {
    if (!propertyId) {
      setLoading(false)
      return
    }

    try {
      const response = await getPropertyReviews(propertyId)
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || []
      setReviews(data)
    } catch (error) {
      console.log('Error fetching reviews:', error)
      showAlert('Error', 'Unable to load reviews at this time.', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadReviews()
  }

  const getAlertStyle = type => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: COLORS.success }
      case 'error':
        return { icon: 'error', color: COLORS.error }
      case 'warning':
        return { icon: 'warning', color: COLORS.warning }
      default:
        return { icon: 'info', color: COLORS.primary }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back-ios"
            size={18}
            color={COLORS.text}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {propertyTitle ? `${propertyTitle} Reviews` : 'Reviews & Ratings'}
        </Text>
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
            item.reviewId?.toString() || index.toString()
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.reviewItemCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.tenant?.name
                      ? item.tenant.name.charAt(0).toUpperCase()
                      : item.userName
                        ? item.userName.charAt(0).toUpperCase()
                        : 'U'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>
                    {item.tenant?.name || item.userName || 'Verified Tenant'}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {item.createAt
                      ? new Date(item.createAt).toLocaleDateString()
                      : item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : 'Recently'}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingBadgeText}>{item.rating || 5}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{item.comment}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Icon name="rate-review" size={36} color={COLORS.subText} />
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptySub}>
                There are no reviews posted for this property yet.
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
      paddingBottom: 12,
      paddingTop: Platform.OS === 'android' ? 8 : 8,
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
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    backIcon: {
      marginLeft: 6,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
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
      paddingBottom: 40,
    },

    /* Review Item Cards */
    reviewItemCard: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    reviewCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: COLORS.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: COLORS.primary,
      fontWeight: '800',
      fontSize: 16,
    },
    reviewerName: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
    },
    reviewDate: {
      fontSize: 11,
      color: COLORS.subText,
      marginTop: 2,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    ratingBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#B88600',
    },
    reviewComment: {
      fontSize: 14,
      color: COLORS.subText,
      lineHeight: 20,
    },

    /* Empty State */
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
      backgroundColor: COLORS.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: 10,
    },
    emptySub: {
      fontSize: 13,
      color: COLORS.subText,
      textAlign: 'center',
      marginTop: 4,
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
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      elevation: 10,
    },
    alertIconContainer: {
      width: 68,
      height: 68,
      borderRadius: 34,
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
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    alertButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
  })
