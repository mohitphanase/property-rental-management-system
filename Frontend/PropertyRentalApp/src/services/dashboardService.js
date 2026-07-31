import api from "./api";

export const getDashboardData = async () => {
  const response = await api.get("/owner/dashboard");
  return response.data;
};