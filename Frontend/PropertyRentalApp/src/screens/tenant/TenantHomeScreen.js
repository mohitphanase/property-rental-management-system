import React, { useContext, useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native"

import Icon from "react-native-vector-icons/MaterialIcons"

import COLORS from "../../theme/colors"
import { AuthContext } from "../../provider/AuthProvider"
import { getProperties } from "../../services/propertyService"
import { SERVER_URL } from "../../utils/config"
import { useNavigation } from "@react-navigation/native"

export default function TenantHomeScreen() {
  const navigation = useNavigation()
  const { user } = useContext(AuthContext)

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const response = await getProperties()

      console.log(response.data.data)

      setProperties(response.data.data)
      setFilteredProperties(response.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const searchProperty = (text) => {
    setSearch(text)

    if (text === "") {
      setFilteredProperties(properties)
      return
    }

    const result = properties.filter((item) => {
      return (
        item.propertyName?.toLowerCase().includes(text.toLowerCase()) ||
        item.city?.toLowerCase().includes(text.toLowerCase())
      )
    })

    setFilteredProperties(result)
  }

  const sortProperties = (option) => {
    let data = [...filteredProperties]

    if (option === "LowToHigh") {
      data.sort((a, b) => (a.price ?? a.rent) - (b.price ?? b.rent))
    }

    if (option === "HighToLow") {
      data.sort((a, b) => (b.price ?? b.rent) - (a.price ?? a.rent))
    }

    setFilteredProperties(data)
  }

  const renderProperty = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          item.propertyImage
            ? { uri: `${SERVER_URL}${item.propertyImage}` }
            : require("../../../assets/property_placeholder.png")
        }
        style={styles.propertyImage}
      />

      <Text style={styles.propertyTitle}>{item.title}</Text>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <Text style={styles.location}>📍 {item.city}</Text>

      <Text style={styles.location}>🏠 {item.propertyType}</Text>

      <Text style={styles.price}>₹{item.price}/Month</Text>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() =>
          navigation.navigate("PropertyDetails", {
            property: item,
          })
        }
      >
        <Text style={styles.detailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Hello 👋 {user?.name || user?.fullName || user?.firstName || "Tenant"}
      </Text>

      <Text style={styles.title}>Find Your Dream Property</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Search by city or property..."
          value={search}
          onChangeText={searchProperty}
        />

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() =>
            Alert.alert("Sort Properties", "Choose sorting option", [
              {
                text: "Price: Low to High",
                onPress: () => sortProperties("LowToHigh"),
              },
              {
                text: "Price: High to Low",
                onPress: () => sortProperties("HighToLow"),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ])
          }
        >
          <Icon name="sort" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Featured Properties</Text>

      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.propertyId.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  welcome: {
    fontSize: 18,
    color: COLORS.subText,
    fontWeight: "500",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 5,
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  search: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,

    borderWidth: 1,
    borderColor: COLORS.border,

    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sortButton: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",

    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  propertyImage: {
    width: "100%",
    height: 220,
    backgroundColor: COLORS.placeholder,
  },

  propertyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginHorizontal: 15,
    marginTop: 15,
  },

  location: {
    fontSize: 15,
    color: COLORS.subText,
    marginHorizontal: 15,
    marginTop: 8,
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.success,
    marginHorizontal: 15,
    marginTop: 12,
  },

  detailsButton: {
    margin: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",

    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  detailsText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    fontSize: 18,
    color: COLORS.subText,
    fontWeight: "600",
  },

  description: {
    fontSize: 14,
    color: COLORS.subText,
    marginHorizontal: 15,
    marginTop: 6,
    lineHeight: 20,
  },
})
