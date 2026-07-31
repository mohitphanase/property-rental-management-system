
import React, { useContext } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
} from "react-native";

import { AuthContext } from "../../../provider/AuthProvider";

import DashboardHeader from "../../../components/owner/DashboardHeader";
import StatsCard from "../../../components/owner/StatsCard";
import SectionHeader from "../../../components/common/SectionHeader";
import QuickActionButton from "../../../components/owner/QuickActionButton";
import RecentBookingCard from "../../../components/owner/RecentBookingCard";
import PropertyCard from "../../../components/property/PropertyCard";
import COLORS from "../../../theme/colors";
import dashboardData from './../../../constants/dashboardData';

export default function DashboardScreen() {

  const { user } = useContext(AuthContext);



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
            value={dashboardData.stats.totalProperties}
            icon="home"
            color={COLORS.primary}
          />

          <StatsCard
            title="Bookings"
            value={dashboardData.stats.totalBookings}
            icon="calendar"
            color={COLORS.success}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Pending"
            value={dashboardData.stats.pendingRequests}
            icon="time"
            color={COLORS.warning}
          />

          <StatsCard
            title="Earnings"
            value={dashboardData.stats.totalEarnings}
            icon="wallet"
            color={COLORS.danger}
          />
        </View>

      </View>

      {/* Quick Actions */}

      <SectionHeader
        title="Quick Actions"
      />

      <View style={styles.quickActionsContainer}>
        {dashboardData.quickActions.map((item) => (
          <QuickActionButton
            key={item.id}
            title={item.title}
            icon={item.icon}
            color={item.color}
            onPress={() => {
              console.log(item.title);
            }}
          />
        ))}
      </View>
      <SectionHeader
        title="Recent Bookings"
        buttonText="See All"
        onPress={() => { }}
      />

      {dashboardData.recentBookings.map((booking) => (
        <RecentBookingCard
          key={booking.id}
          tenant={booking.tenant}
          property={booking.property}
          date={booking.date}
          status={booking.status}
        />
      ))}

      <SectionHeader
        title="Latest Properties"
        buttonText="View All"
        onPress={() => { }}
      />

      {dashboardData.latestProperties.map((property) => (
        <PropertyCard
          key={property.id}
          title={property.title}
          location={property.location}
          price={property.price}
          image={property.image}
          onPress={() => { }}
        />
      ))}

      {/* Bottom Space */}

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


