// import api from "./api";

// const login = async (credentials) => {
//   const response = await api.post("/user/login", credentials);
//   return response.data;
// };

// const register = async (user) => {
//   const response = await api.post("/user/register", user);
//   return response.data;
// };

// const getProfile = async (token) => {
//   const response = await api.get("/user/profile", {
//     headers: {
//       Authorization:`${token}`,
//     },
//   });

//   return response.data;
// };

// export default {
//   login,
//   register,
//   getProfile,
// };

import { SERVER_URL } from "../utils/config";
import api from "./api";

export const login = async (credentials) => {
  console.log("server:", SERVER_URL)
  const response = await api.post("/user/login", credentials);
  return response.data;
};

export const register = async (user) => {
  const response = await api.post("/user/register", user);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};