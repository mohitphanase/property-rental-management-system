import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

import COLORS from "../../theme/colors"
import { SERVER_URL } from "../../utils/config"
import { getWishlist, removeWishlist } from "../../services/wishlistService"

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const response = await getWishlist()

      console.log("Wishlist:", response.data)

      setWishlist(response.data)
    } catch (error) {
      console.log(error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveWishlist = async (wishlistId) => {
    try {
      await removeWishlist(wishlistId)

      // Remove from UI immediately
      setWishlist((prev) =>
        prev.filter((item) => item.wishlistId !== wishlistId),
      )

      Alert.alert("Success", "Property removed from wishlist.")
    } catch (error) {
      console.log(error.response?.data || error.message)

      Alert.alert("Error", "Unable to remove property.")
    }
  }

  const renderItem = ({ item }) => {
    const property = item.property

    return (
      <View style={styles.card}>
        <Image
          source={
            property?.propertyImage
              ? { uri: `${SERVER_URL}${property.propertyImage}` }
              : require("../../../assets/property_placeholder.png")
          }
          style={styles.image}
        />

        <View style={styles.details}>
          <Text style={styles.name}>
            {property?.title || property?.propertyName}
          </Text>

          <Text style={styles.location}>
            📍 {property?.city || property?.location}
          </Text>

          <Text style={styles.price}>₹{property?.price || property?.rent}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("PropertyDetails", {
                property: property,
              })
            }
          >
            <Text style={styles.buttonText}>View Property</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.favorite}
          onPress={() => handleRemoveWishlist(item.wishlistId)}
        >
          <Icon name="favorite" size={28} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Wishlist</Text>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.wishlistId.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="favorite-border" size={80} color={COLORS.placeholder} />

            <Text style={styles.emptyText}>No properties in wishlist</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    marginBottom: 18,
    overflow: "hidden",

    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  image: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.placeholder,
  },

  details: {
    padding: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },

  location: {
    fontSize: 15,
    color: COLORS.subText,
    marginTop: 5,
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 10,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 15,
  },

  favorite: {
    position: "absolute",
    top: 15,
    right: 15,
  },

  emptyContainer: {
    marginTop: 120,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 15,
    fontSize: 18,
    color: COLORS.subText,
  },
})
