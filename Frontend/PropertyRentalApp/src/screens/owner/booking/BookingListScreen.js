// import React, { useCallback, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
// } from "react-native";
// import { useFocusEffect } from "@react-navigation/native";
// import { Alert, TouchableOpacity } from "react-native";
// import { updateBookingStatus } from "../../../services/bookingService1";

// import { getOwnerBookings } from "../../../services/bookingService1";
// import COLORS from "../../../theme/colors";

// export default function BookingListScreen() {

//   const [bookings, setBookings] = useState([]);

//   const loadBookings = async () => {
//     try {
//       const response = await getOwnerBookings();
//       console.log("Bookings Data:", JSON.stringify(response.data.data, null, 2));
//       setBookings(response.data.data);

//     } catch (error) {
//       console.log(error.response?.data || error);
//     }
//   };

//   const changeStatus = async (bookingId, status) => {
//     try {
//       await updateBookingStatus(bookingId, status);

//       Alert.alert("Success", `Booking ${status.toLowerCase()} successfully`);

//       loadBookings();
//     } catch (error) {
//       console.log(error.response?.data || error);
//     }
//   };
//   useFocusEffect(
//     useCallback(() => {
//       loadBookings();
//     }, [])
//   );

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>

//       {/* <Text style={styles.title}>
//         Booking #{item.bookingId}
//       </Text> */}

//       <Text style={styles.title}>
//         Name : {item.tenantName}
//       </Text>

//       <Text style={styles.text}>
//         Start Date : {item.startDate}
//       </Text>

//       <Text style={styles.text}>
//         End Date : {item.endDate}
//       </Text>

//       <Text style={styles.status}>
//         Status : {item.status}
//       </Text>

//       {item.status === "PENDING" && (
//         <View style={styles.buttonContainer}>

//           <TouchableOpacity
//             style={styles.acceptButton}
//             onPress={() => changeStatus(item.bookingId, "APPROVED")}
//           >
//             <Text style={styles.buttonText}>Accept</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.rejectButton}
//             onPress={() => changeStatus(item.bookingId, "REJECTED")}
//           >
//             <Text style={styles.buttonText}>Reject</Text>
//           </TouchableOpacity>

//         </View>
//       )}

//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={bookings}
//         keyExtractor={(item) => item.bookingId.toString()}
//         renderItem={renderItem}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({

//   container: {
//     marginTop: 20,
//     flex: 1,
//     backgroundColor: COLORS.background,
//     padding: 15,
//   },

//   card: {
//     backgroundColor: COLORS.white,
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 2,
//   },

//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },

//   text: {
//     fontSize: 14,
//     marginTop: 5,
//   },

//   status: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: COLORS.primary,
//     marginTop: 8,
//   },

//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 15,
//   },

//   acceptButton: {
//     backgroundColor: COLORS.success,
//     paddingVertical: 10,
//     paddingHorizontal: 25,
//     borderRadius: 8,
//   },

//   rejectButton: {
//     backgroundColor: COLORS.danger,
//     paddingVertical: 10,
//     paddingHorizontal: 25,
//     borderRadius: 8,
//   },

//   buttonText: {
//     color: COLORS.white,
//     fontWeight: "bold",
//   },
// });


import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { updateBookingStatus, getOwnerBookings } from "../../../services/bookingService1";
import COLORS from "../../../theme/colors";

// Fallback theme palette in case specific keys aren't in COLORS
const THEME = {
  primary: COLORS?.primary || "#4F46E5",
  background: COLORS?.background || "#F8FAFC",
  cardBg: COLORS?.white || "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  
  // Status Colors & Badges
  pendingBg: "#FEF3C7",
  pendingText: "#D97706",
  approvedBg: "#D1FAE5",
  approvedText: "#059669",
  rejectedBg: "#FEE2E2",
  rejectedText: "#DC2626",
  
  // Buttons
  acceptBtn: COLORS?.success || "#10B981",
  rejectBtn: COLORS?.danger || "#EF4444",
};

export default function BookingListScreen() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const response = await getOwnerBookings();
      JSON.stringify(response.data.data, null, 2);
      setBookings(response.data.data || []);
    } catch (error) {
      error.response?.data || error;
    }
  };

  const changeStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      Alert.alert("Success", `Booking ${status.toLowerCase()} successfully`);
      loadBookings();
    } catch (error) {
      error.response?.data || error;
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  // Helper for dynamic status badge styles
  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return { container: styles.badgeApproved, text: styles.badgeTextApproved };
      case "REJECTED":
        return { container: styles.badgeRejected, text: styles.badgeTextRejected };
      default:
        return { container: styles.badgePending, text: styles.badgeTextPending };
    }
  };

  // Helper for Avatar Initials
  const getInitials = (name) => {
    if (!name) return "B";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const renderItem = ({ item }) => {
    const badgeStyle = getStatusBadgeStyle(item.status);
    const initials = getInitials(item.tenantName);

    return (
      <View style={styles.card}>
        {/* Card Header: Avatar + Tenant Name + Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.tenantInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.tenantTextContainer}>
              <Text style={styles.tenantName}>{item.tenantName || "Tenant"}</Text>
              <Text style={styles.bookingIdText}>ID: #{item.bookingId}</Text>
            </View>
          </View>
          <View style={[styles.badge, badgeStyle.container]}>
            <Text style={[styles.badgeText, badgeStyle.text]}>
              {item.status || "PENDING"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Date Details Box */}
        <View style={styles.datesContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>START DATE</Text>
            <Text style={styles.dateValue}>{item.startDate || "N/A"}</Text>
          </View>

          <View style={styles.dateSeparator} />

          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>END DATE</Text>
            <Text style={styles.dateValue}>{item.endDate || "N/A"}</Text>
          </View>
        </View>

        {/* Action Buttons for Pending State */}
        {item.status === "PENDING" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => changeStatus(item.bookingId, "REJECTED")}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => changeStatus(item.bookingId, "APPROVED")}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      <View style={styles.container}>
        {/* Header Summary */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Booking Requests</Text>
            <Text style={styles.headerSubtitle}>
              Manage tenant booking requests
            </Text>
          </View>
          {pendingCount > 0 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{pendingCount} Pending</Text>
            </View>
          )}
        </View>

        <FlatList
          data={bookings}
          keyExtractor={(item) => item.bookingId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>📋</Text>
              </View>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any booking requests at the moment.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  container: {

    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 16,
    paddingTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: THEME.pendingBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: THEME.pendingText,
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.border,

    // Soft cross-platform shadows
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tenantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  tenantTextContainer: {
    justifyContent: "center",
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  bookingIdText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgePending: {
    backgroundColor: THEME.pendingBg,
  },
  badgeTextPending: {
    color: THEME.pendingText,
  },
  badgeApproved: {
    backgroundColor: THEME.approvedBg,
  },
  badgeTextApproved: {
    color: THEME.approvedText,
  },
  badgeRejected: {
    backgroundColor: THEME.rejectedBg,
  },
  badgeTextRejected: {
    color: THEME.rejectedText,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  datesContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textPrimary,
  },
  dateSeparator: {
    width: 1,
    height: 24,
    backgroundColor: THEME.border,
    marginHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: THEME.acceptBtn,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.acceptBtn,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButtonText: {
    color: THEME.rejectBtn,
    fontWeight: "700",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    textAlign: "center",
  },
});