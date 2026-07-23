import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL, TOKEN_KEY } from "../utils/config";

const api = axios.create({
  baseURL: SERVER_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Token = `${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;