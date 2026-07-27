import React from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import COLORS from "../../theme/colors"

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property } = route.params

  return (
    <ScrollView style={styles.container}>
      <Image
        source={
          property.propertyImage
            ? { uri: property.propertyImage }
            : require("../../../assets/property_placeholder.png")
        }
        style={styles.image}
      />

      <View style={styles.card}>
        <Text style={styles.title}>{property.title}</Text>

        <Text style={styles.price}>₹{property.price}/Month</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Location :</Text>

          <Text style={styles.value}>{property.city}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Property Type :</Text>

          <Text style={styles.value}>{property.propertyType}</Text>
        </View>

        <Text style={styles.section}>Description</Text>

        <Text style={styles.description}>{property.description}</Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate("BookProperty", {
              property,
            })
          }
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  image: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.placeholder,
  },

  card: {
    backgroundColor: COLORS.card,
    margin: 15,
    padding: 20,
    borderRadius: 18,

    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },

  price: {
    fontSize: 22,
    color: COLORS.success,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },

  value: {
    fontSize: 16,
    color: COLORS.subText,
  },

  section: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 10,
  },

  description: {
    fontSize: 15,
    color: COLORS.subText,
    lineHeight: 24,
  },

  bookButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
})
