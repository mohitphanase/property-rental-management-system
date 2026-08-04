import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native"
import PropertyCard from "../../../components/property/PropertyCard";
import SectionHeader from "../../../components/common/SectionHeader";
import COLORS from "../../../theme/colors";
import { getMyProperties } from "../../../services/propertyService";
import { SERVER_URL } from "../../../utils/config";


export default function MyPropertiesScreen({ navigation }) {

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [])
  );

  

  const loadProperties = async () => {
    try {
      const response = await getMyProperties();

      console.log("Properties:", response.data.data);

      setProperties(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="My Properties"
        buttonText="Add New"
        onPress={() => navigation.navigate("AddProperty")}
      />

      <FlatList
        data={properties}
        keyExtractor={(item) => item.propertyId.toString()}
        renderItem={({ item }) => (
          <PropertyCard
            title={item.title}
            location={item.city}
            price={item.price}
            image={
              item.imageUrl
                ? `${SERVER_URL}/${item.imageUrl}`
                : null
            }
            onPress={() =>
              navigation.navigate("PropertyDetails", {
                propertyId: item.propertyId,
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 10,
  },
});