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

  const totalReviews = reviews.length
  const averageRating = totalReviews
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
      totalReviews
    : 0

  // Distribution for the 5 -> 1 star breakdown bars
  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(
      r => Math.round(Number(r.rating) || 0) === star
    ).length
    return {
      star,
      count,
      pct: totalReviews ? count / totalReviews : 0,
    }
  })

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
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListHeaderComponent={
            totalReviews ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                  <View style={styles.summaryScoreBlock}>
                    <Text style={styles.summaryScore}>
                      {averageRating.toFixed(1)}
                    </Text>
                    <View style={styles.summaryStarsRow}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Icon
                          key={star}
                          name={
                            star <= Math.round(averageRating)
                              ? 'star'
                              : 'star-outline'
                          }
                          size={15}
                          color="#FFB800"
                          style={{ marginRight: 1 }}
                        />
                      ))}
                    </View>
                    <Text style={styles.summaryCount}>
                      {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryBars}>
                    {distribution.map(row => (
                      <View key={row.star} style={styles.summaryBarRow}>
                        <Text style={styles.summaryBarLabel}>{row.star}</Text>
                        <Icon name="star" size={10} color="#FFB800" />
                        <View style={styles.summaryBarTrack}>
                          <View
                            style={[
                              styles.summaryBarFill,
                              {
                                width: `${Math.max(row.pct * 100, row.count ? 6 : 0)}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.summaryBarCount}>{row.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : null
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
                  <Text style={styles.reviewerName} numberOfLines={1}>
                    {item.tenant?.name || item.userName || 'Verified Tenant'}
                  </Text>
                  <View style={styles.dateRow}>
                    <Icon name="schedule" size={11} color={COLORS.subText} />
                    <Text style={styles.reviewDate}>
                      {item.createAt
                        ? new Date(item.createAt).toLocaleDateString()
                        : item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : 'Recently'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={13} color="#FFB800" />
                  <Text style={styles.ratingBadgeText}>{item.rating || 5}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{item.comment}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBubble}>
                <Icon name="rate-review" size={34} color={COLORS.primary} />
              </View>
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

            <TouchableOpacity
              style={[
                styles.alertButton,
                { backgroundColor: getAlertStyle(alertConfig.type).color },
              ]}
              activeOpacity={0.85}
              onPress={closeAlert}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
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
      fontSize: 18,
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
      paddingBottom: 40,
    },

    /* Summary Card */
    summaryCard: {
      backgroundColor: COLORS.card,
      borderRadius: 22,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: COLORS.border,
      ...shadow(4),
    },
    summaryTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    summaryScoreBlock: {
      alignItems: 'center',
      paddingRight: 16,
    },
    summaryScore: {
      fontSize: 34,
      fontWeight: '800',
      color: COLORS.text,
      lineHeight: 38,
    },
    summaryStarsRow: {
      flexDirection: 'row',
      marginTop: 2,
      marginBottom: 4,
    },
    summaryCount: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.subText,
    },
    summaryDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: COLORS.border,
      marginRight: 16,
    },
    summaryBars: {
      flex: 1,
      gap: 5,
    },
    summaryBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    summaryBarLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.subText,
      width: 8,
    },
    summaryBarTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.background,
      overflow: 'hidden',
      marginHorizontal: 4,
    },
    summaryBarFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: '#FFB800',
    },
    summaryBarCount: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.subText,
      width: 16,
      textAlign: 'right',
    },

    /* Review Item Cards */
    reviewItemCard: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      ...shadow(3),
    },
    reviewCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: COLORS.primary + '18',
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
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 3,
    },
    reviewDate: {
      fontSize: 11,
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
    ratingBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#B88600',
    },
    reviewComment: {
      fontSize: 14,
      color: COLORS.text,
      lineHeight: 20,
    },

    /* Empty State */
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 36,
      backgroundColor: COLORS.card,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      borderStyle: 'dashed',
      marginTop: 24,
    },
    emptyIconBubble: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: COLORS.primary + '14',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
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
      lineHeight: 18,
      maxWidth: 240,
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
  })
