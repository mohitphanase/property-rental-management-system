import React, { useContext, useEffect, useState, useCallback } from "react";
import {ScrollView, View, StyleSheet, } from "react-native";
import { useFocusEffect } from "@react-navigation/native";



import DashboardHeader from "../../../components/owner/DashboardHeader";
import StatsCard from "../../../components/owner/StatsCard";
import SectionHeader from "../../../components/common/SectionHeader";
import QuickActionButton from "../../../components/owner/QuickActionButton";
import RecentBookingCard from "../../../components/owner/RecentBookingCard";
import PropertyCard from "../../../components/property/PropertyCard";
import COLORS from "../../../theme/colors";
import dashboardData from "../../../constants/dashboardData";
import { AuthContext } from "../../../provider/AuthProvider";
import { getDashboardData } from "../../../services/dashboardService";
import { getMyProperties } from "../../../services/propertyService";
import { SERVER_URL } from "../../../utils/config";
import { getOwnerBookings } from './../../../services/bookingService1';

export default function DashboardScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [latestProperties, setLatestProperties] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [dashboard, setDashboard] = useState({
    totalProperties: 0,
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
      loadLatestProperties();
      loadRecentBookings();
    }, [])
  );



  const loadDashboard = async () => {
    try {
      const response = await getDashboardData();

      console.log("Dashboard:", response.data);

      setDashboard(response.data.data);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };
  // useEffect(() => {
  //   loadLatestProperties();
  // }, []);

  const loadLatestProperties = async () => {
    try {
      const response = await getMyProperties();

      console.log("Dashboard Properties:", response.data.data);

      setLatestProperties(response.data.data);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };


  const loadRecentBookings = async () => {
    try {
      const response = await getOwnerBookings();

      console.log("Recent Bookings:", response.data.data);

      const bookings = response.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRecentBookings(bookings.slice(0, 3));

    } catch (error) {
      console.log(error.response?.data || error);
    }
  };


  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <DashboardHeader
        name={user?.name || "Owner"}
      />

      {/* Statistics */}

      <View style={styles.statsContainer}>

        <View style={styles.statsRow}>
          <StatsCard
            title="Properties"
            value={dashboard.totalProperties}
            icon="home"
            color={COLORS.primary}
          />

          <StatsCard
            title="Bookings"
            value={dashboard.totalBookings}
            icon="calendar"
            color={COLORS.success}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Pending"
            value={dashboard.pendingRequests}
            icon="time"
            color={COLORS.warning}
          />

          <StatsCard
            title="Earnings"
            value={dashboard.totalEarnings}
            icon="wallet"
            color={COLORS.danger}
          />
        </View>

      </View>

      {/* Quick Actions */}

      <SectionHeader title="Quick Actions" />

      <View style={styles.quickActionsContainer}>
        {dashboardData.quickActions.map((item) => (
          <QuickActionButton
            key={item.id}
            title={item.title}
            icon={item.icon}
            color={item.color}
            onPress={() => {
              switch (item.title) {
                case "Add Property":
                  navigation.navigate("Properties", {
                    screen: "AddProperty",
                  });
                  break;

                case "Bookings":
                  navigation.navigate("Bookings");
                  break;

                case "Payments":
                  alert("Payments module coming soon");
                  break;
              }
            }}
          />
        ))}
      </View>

      {/* Recent Bookings */}

      <SectionHeader
        title="Recent Bookings"
        buttonText="See All"
        onPress={() =>
          navigation.navigate("Bookings")}
      />

      {recentBookings.map((booking) => (
        <RecentBookingCard
          key={booking.bookingId}
          tenant={booking.tenantName}
          property={booking.propertyTitle}
          date={booking.startDate}
          status={booking.status}
          onPress={() => navigation.navigate("Bookings")}
        />
      ))}

      {/* Latest Properties */}

      <SectionHeader
        title="Latest Properties"
        buttonText="View All"
        onPress={() =>
          navigation.navigate("Properties",
            {
              screen: "MyProperties"
            })
        }
      />

      {latestProperties.slice(0, 3).map((property) => (
        <PropertyCard
          key={property.propertyId}
          title={property.title}
          location={property.city}
          price={property.price}
          image={
            property.imageUrl
              ? `${SERVER_URL}/${property.imageUrl}`
              : null
          }
          // onPress={() =>
          //   navigation.navigate("PropertyDetails", {
          //     propertyId: property.propertyId,
          //   })
          // }
          onPress={() =>
            navigation.navigate("Properties", {
              screen: "PropertyDetails",
              params: {
                propertyId: property.propertyId,
              },
            })
          }
        />
      ))}

      <View style={styles.bottomSpace} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  statsContainer: {
    marginTop: 15,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  bottomSpace: {
    height: 30,
  },
});