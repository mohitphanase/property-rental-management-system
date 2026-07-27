import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SERVER_URL, TOKEN_KEY } from "../utils/config"

export const addWishlist = async (propertyId) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.post(
    `${SERVER_URL}/wishlists`,
    {
      propertyId,
    },
    {
      headers: {
        Token: token,
      },
    },
  )
}

export const getWishlist = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/wishlists/user`, {
    headers: {
      Token: token,
    },
  })
}
