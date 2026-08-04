import api from "./api";

export const getOwnerBookings = async () => {
  return api.get("/owner/properties/bookings");
};

export const updateBookingStatus = async (bookingId, status) => {
  return api.put(`/owner/properties/bookings/${bookingId}/status`, {
    status,
  });
};

