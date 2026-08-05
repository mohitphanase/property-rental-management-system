import React, { useState, useCallback, useContext } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import PropertyCard from '../../../components/property/PropertyCard'
import SectionHeader from '../../../components/common/SectionHeader'
import { ThemeContext } from '../../../provider/ThemeProvider'
import { getMyProperties } from '../../../services/propertyService'
import { SERVER_URL } from '../../../utils/config'

export default function MyPropertiesScreen({ navigation }) {
  // Pulling dynamic COLORS from global theme
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadProperties = async () => {
    try {
      const response = await getMyProperties()
      setProperties(response.data?.data || [])
    } catch (error) {
      console.log('Error loading properties:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProperties()
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadProperties()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          COLORS.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={COLORS.background}
      />
      <View style={styles.container}>
        <SectionHeader
          title="My Properties"
          buttonText="Add New"
          onPress={() => navigation.navigate('AddProperty')}
        />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={item => item.propertyId.toString()}
            renderItem={({ item }) => (
              <PropertyCard
                title={item.title}
                location={item.city}
                price={item.price}
                image={item.imageUrl ? `${SERVER_URL}/${item.imageUrl}` : null}
                onPress={() =>
                  navigation.navigate('PropertyDetails', {
                    propertyId: item.propertyId,
                  })
                }
              />
            )}
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon
                    name="other-houses"
                    size={36}
                    color={COLORS.placeholder}
                  />
                </View>
                <Text style={styles.emptyTitle}>No Properties Listed</Text>
                <Text style={styles.emptySubtitle}>
                  Tap "Add New" above to list your first property.
                </Text>
              </View>
            }
          />
        )}
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
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 20,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
      elevation: 2,
      shadowColor: COLORS.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: COLORS.subText,
      textAlign: 'center',
      lineHeight: 20,
    },
  })
