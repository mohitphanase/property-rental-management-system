import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Alert } from "react-native";

import COLORS from "../../../theme/colors";
import { SERVER_URL } from "../../../utils/config";
import PrimaryButton from "../../../components/common/PrimaryButton";
import { getPropertyById, deleteProperty, } from "../../../services/PropertyService";


export default function PropertyDetailsScreen({ route, navigation }) {
  const { propertyId } = route.params;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   loadProperty();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperty();
    }, [propertyId])
  );

  const loadProperty = async () => {
    try {
      const response = await getPropertyById(propertyId);
      console.log(response.data.data)
      setProperty(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProperty(property.propertyId);

              Alert.alert("Success", "Property deleted successfully");

              navigation.goBack();
            } catch (error) {
              console.log(error.response?.data || error);
              Alert.alert("Error", "Failed to delete property");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <Image
        source={{
          uri: `${SERVER_URL}/${property.imageUrl}`,
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{property.title}</Text>

        <Text style={styles.label}>City</Text>
        <Text style={styles.value}>{property.city}</Text>

        <Text style={styles.label}>Property Type</Text>
        <Text style={styles.value}>{property.propertyType}</Text>

        <Text style={styles.label}>Monthly Rent</Text>
        <Text style={styles.price}>₹ {property.price}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>
          {property.description || "No description available."}
        </Text>
        <PrimaryButton
          title="Edit Property"
          onPress={() =>
            navigation.navigate("EditProperty", {
              property: property,
            })
          }
        />
        <PrimaryButton
          title="Delete Property"
          onPress={handleDeleteProperty}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 250,
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 15,
  },

  value: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 4,
  },

  price: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: "bold",
    marginTop: 4,
  },

  description: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 6,
    lineHeight: 24,
  },
});