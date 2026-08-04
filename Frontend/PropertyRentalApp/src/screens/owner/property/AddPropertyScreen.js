import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

import CustomInput from "../../../components/common/CustomInput";
import PrimaryButton from "../../../components/common/PrimaryButton";
import COLORS from "../../../theme/colors";
import { addProperty, uploadPropertyImage, } from "../../../services/propertyService";

export default function AddPropertyScreen({navigation}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddProperty = async () => {
    const propertyData = {
      title,
      description,
      address,
      city,
      price,
      propertyType,
    };

    try {
      // Save property
      const response = await addProperty(propertyData);

      const propertyId = response.data.data.propertyId;

      // Upload image if selected
      if (image) {
        await uploadPropertyImage(propertyId, image);
      }

      alert("Property Added Successfully");

      navigation.goBack();
      // loadProperties();

    } catch (error) {
      console.log(error.response?.data || error);

      alert("Failed to add property");
    }
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Upload Image */}

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={pickImage}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        ) : (
          <>
            <Ionicons
              name="camera-outline"
              size={45}
              color={COLORS.primary}
            />

            <Text style={styles.uploadText}>
              Upload Property Image
            </Text>
          </>
        )}
      </TouchableOpacity>

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

      <CustomInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />

      <CustomInput
        placeholder="Monthly Rent"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={propertyType}
          onValueChange={(value) => setPropertyType(value)}
        >
          <Picker.Item label="Apartment" value="APARTMENT" />
          <Picker.Item label="House" value="HOUSE" />
          <Picker.Item label="Villa" value="VILLA" />
          <Picker.Item label="PG" value="PG" />
          <Picker.Item label="Room" value="ROOM" />
        </Picker>
      </View>

      <PrimaryButton
        title="Add Property"
        onPress={handleAddProperty}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
  },

  imageContainer: {
    height: 180,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  uploadText: {
    marginTop: 10,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
});