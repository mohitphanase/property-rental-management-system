import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../theme/colors";

export default function RecentBookingCard({
  tenant,
  property,
  date,
  status,
  onPress,
}) {

  const getStatusColor = () => {
    switch (status) {
      case "APPROVED":
        return COLORS.success;

      case "PENDING":
        return COLORS.warning;

      case "REJECTED":
        return COLORS.danger;

      default:
        return COLORS.gray;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >

      <View style={styles.topRow}>

        <View style={{ flex: 1 }}>

          <Text style={styles.tenant}>
            {tenant}
          </Text>

          <Text style={styles.property}>
            {property}
          </Text>

        </View>

        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor: getStatusColor(),
            },
          ]}
        >
          <Text style={styles.status}>
            {status}
          </Text>
        </View>

      </View>

      <View style={styles.bottomRow}>

        <Ionicons
          name="calendar-outline"
          size={16}
          color={COLORS.gray}
        />

        <Text style={styles.date}>
          {date}
        </Text>

      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tenant: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  property: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.gray,
  },

  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  status: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 12,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  date: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.gray,
  },
});