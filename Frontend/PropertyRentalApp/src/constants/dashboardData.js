const dashboardData = {
    stats: {
        totalProperties: 15,
        totalBookings: 28,
        pendingRequests: 4,
        totalEarnings: "₹1,25,000",
    },

    recentBookings: [
        {
            id: 1,
            tenant: "Rahul Sharma",
            property: "Luxury Apartment",
            status: "Pending",
        },
        {
            id: 2,
            tenant: "Priya Patel",
            property: "Sky View Flat",
            status: "Approved",
        },
    ],

    quickActions: [


        {
            id: 1,
            title: "Add Property",
            icon: "add-circle-outline",
        },
        {
            id: 2,
            title: "Bookings",
            icon: "calendar-outline",
        },

        {
            id: 3,
            title: "Payments",
            icon: "wallet-outline",
            color: "#F59E0B",
        },
    ],

    recentBookings: [
        {
            id: 1,
            tenant: "Rahul Sharma",
            property: "Luxury Apartment",
            date: "27 Jul 2026",
            status: "Pending",
        },
        {
            id: 2,
            tenant: "Priya Patel",
            property: "Sky View Flat",
            date: "26 Jul 2026",
            status: "Approved",
        },
    ],

    latestProperties: [
  {
    id: 1,
    title: "Luxury Apartment",
    location: "Pune",
    price: "25000",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  },
  {
    id: 2,
    title: "Modern Villa",
    location: "Mumbai",
    price: "45000",
    image: "https://picsum.photos/600/400?random=2",
  },
],
};

export default dashboardData;