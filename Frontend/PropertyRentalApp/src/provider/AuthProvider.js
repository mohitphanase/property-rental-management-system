import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { login as loginApi, getProfile } from "../services/authService";
import { TOKEN_KEY, USER_KEY } from "../utils/config";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   loadUser();
  // }, []);

  // useEffect(() => {
  // setLoading(false);
  // }, []);

  useEffect(() => {
  const showSplash = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
    setLoading(false);
  };

  showSplash();
}, []);

  const loadUser = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const savedUser = await AsyncStorage.getItem(USER_KEY);

      if (savedToken) {
        setToken(savedToken);
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      await new Promise(resolve => setTimeout(resolve, 4000));

    } catch (error) {
      console.log("Load User Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi({
        email,
        password,
      });

      if (response.status !== "success") {
        throw new Error(response.message);
      }

      const jwtToken = response.data.token;

      await AsyncStorage.setItem(TOKEN_KEY, jwtToken);

      setToken(jwtToken);

      const profileResponse = await getProfile();

      if (profileResponse.status !== "success") {
        throw new Error(profileResponse.message);
      }

      const currentUser = profileResponse.data;

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(currentUser)
      );

      

      setUser(currentUser);

      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        token,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}